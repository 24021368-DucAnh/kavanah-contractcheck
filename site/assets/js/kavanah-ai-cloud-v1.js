(function(){
 "use strict";
 const endpoint="https://api.groq.com/openai/v1/chat/completions";
 function parseFindings(answer){
  const source=String(answer||"").replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"").trim();
  let parsed;
  try{parsed=JSON.parse(source);}catch(error){
   const starts=[source.indexOf("{"),source.indexOf("[")].filter(index=>index>=0).sort((a,b)=>a-b);
   for(const start of starts){
    for(let end=source.length;end>start;end--){
     const candidate=source.slice(start,end);
     try{parsed=JSON.parse(candidate);break;}catch(parseError){}
    }
    if(parsed!==undefined)break;
   }
   if(parsed===undefined)throw new Error("cloud-ai-invalid-response");
  }
  let findings=Array.isArray(parsed)?parsed:parsed&&Array.isArray(parsed.findings)?parsed.findings:null;
  if(typeof parsed?.findings==="string"){
   try{findings=JSON.parse(parsed.findings);}catch(error){findings=null;}
  }
  if(!findings)throw new Error("cloud-ai-invalid-response");
  let score=parsed&&parsed.score&&typeof parsed.score==="object"?parsed.score:null;
  if(typeof parsed?.score==="string"){
   try{score=JSON.parse(parsed.score);}catch(error){score=null;}
  }
  if(!score&&Array.isArray(parsed?.criteria))score={overall:parsed.overall,label:parsed.label,criteria:parsed.criteria};
  if(score&&(!Array.isArray(score.criteria))){
   const criteria=Array.isArray(parsed?.criteria)?parsed.criteria:Object.values(score.criteria||{});
   if(criteria.length)score=Object.assign({},score,{criteria});
  }
  return {
   findings:findings.filter(item=>item&&typeof item==="object").slice(0,12).map(item=>({
   title:String(item.title||"Nhận định AI cần đối chiếu").trim(),
   severity:String(item.severity||"medium").toLowerCase(),
   level:String(item.level||"AI · Cần đối chiếu").trim(),
   quote:String(item.quote||"").trim(),
   basis:String(item.basis||"Nhận định do AI tạo từ nội dung hợp đồng; cần đối chiếu quy định hiện hành.").trim(),
   uncertainty:String(item.uncertainty||"Cần kiểm tra toàn bộ hợp đồng và tình huống thực tế.").trim(),
   question:String(item.question||"Điều khoản này cần được làm rõ và đối chiếu với căn cứ nào?").trim()
  })),
   score
  };
 }
 function parseScore(answer){
  const source=String(answer||"").replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"").trim();
  let parsed;
  try{parsed=JSON.parse(source);}catch(error){
   const start=Math.min(...[source.indexOf("{"),source.indexOf("[")].filter(index=>index>=0));
   if(!Number.isFinite(start))throw new Error("cloud-ai-invalid-score");
   for(let end=source.length;end>start;end--){try{parsed=JSON.parse(source.slice(start,end));break;}catch(parseError){}}
  }
  let score=parsed&&parsed.score&&typeof parsed.score==="object"?parsed.score:parsed;
  if(typeof parsed?.score==="string"){try{score=JSON.parse(parsed.score);}catch(error){score=null;}}
  if(!score||!Number.isFinite(Number(score.overall)))throw new Error("cloud-ai-invalid-score");
  const criteria=Array.isArray(score.criteria)?score.criteria:Array.isArray(parsed?.criteria)?parsed.criteria:Object.values(score.criteria||{});
  if(criteria.length<6)throw new Error("cloud-ai-invalid-score");
  return Object.assign({},score,{criteria:criteria.slice(0,6)});
 }
 async function analyzeContractWithCloudAI(contractText,contractType){
  const apiKey=window.KAVANAH_GROQ_API_KEY||"";
  if(!apiKey)throw new Error("cloud-ai-key-not-configured");
  const typeName=contractType==="commercial"?"thương mại":"lao động";
  const systemPrompt=`Bạn là chuyên gia rà soát hợp đồng ${typeName} tại Việt Nam.
Trả về duy nhất JSON object, không markdown, gồm:
findings: mảng tối đa 12 phát hiện. Mỗi phát hiện có title, severity (critical/high/medium/low), level, quote, basis, uncertainty, question. Tất cả title, level, quote, basis, uncertainty, question phải bằng tiếng Việt.
score: object có overall (0-9), label, criteria. criteria phải là mảng đúng 6 phần tử; mỗi phần tử có name, score (0-9), reason. label, name và reason bắt buộc phải bằng tiếng Việt, không dùng tiếng Anh.
Chấm 6 tiêu chí: Tính rõ ràng; Tuân thủ pháp luật; Cân bằng quyền và nghĩa vụ; Tính đầy đủ; Kiểm soát rủi ro; Tính khả thi.
Điểm 9 là tốt nhất. Dựa trên nội dung hợp đồng. Không kết luận chắc chắn vi phạm pháp luật.`;
  const messages=[
   {role:"system",content:systemPrompt},
   {role:"user",content:String(contractText||"").trim()}
  ];
   const request=body=>{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),30000);
    return fetch(endpoint,Object.assign({},body,{signal:controller.signal})).finally(()=>clearTimeout(timeout));
   };
   let response=await request({
   method:"POST",
   headers:{"Content-Type":"application/json","Authorization":"Bearer "+apiKey},
   body:JSON.stringify({model:"openai/gpt-oss-20b",messages,temperature:.1,response_format:{type:"json_object"}})
  });
  if(response.status===400){
   response=await request({
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+apiKey},
    body:JSON.stringify({model:"openai/gpt-oss-20b",messages,temperature:.1})
   });
  }
  let data;
  try{data=await response.json();}catch(error){throw new Error("cloud-ai-invalid-response");}
  if(!response.ok){
   const detail=data&&data.error&&data.error.message||response.statusText||"HTTP "+response.status;
   throw new Error("cloud-ai-http-"+response.status+": "+detail);
  }
  const answer=data&&data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content;
  const result=parseFindings(answer);
  if(result.score)return result;
  const scoreMessages=[
   {role:"system",content:"Trả về duy nhất JSON object có overall là số 0-9, label bằng tiếng Việt, criteria là mảng đúng 6 phần tử. Mỗi phần tử có name bằng tiếng Việt, score là số 0-9, reason bằng tiếng Việt. Chấm: Tính rõ ràng, Tuân thủ pháp luật, Cân bằng quyền và nghĩa vụ, Tính đầy đủ, Kiểm soát rủi ro, Tính khả thi khi thực hiện."},
   {role:"user",content:String(contractText||"").trim()}
  ];
  let scoreResponse=await request({
   method:"POST",
   headers:{"Content-Type":"application/json","Authorization":"Bearer "+apiKey},
   body:JSON.stringify({model:"openai/gpt-oss-20b",messages:scoreMessages,temperature:.1,response_format:{type:"json_object"}})
  });
  if(scoreResponse.status===400){
   scoreResponse=await request({
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+apiKey},
    body:JSON.stringify({model:"openai/gpt-oss-20b",messages:scoreMessages,temperature:.1})
   });
  }
  if(!scoreResponse.ok)throw new Error("cloud-ai-score-http-"+scoreResponse.status);
  let scoreData;try{scoreData=await scoreResponse.json();}catch(error){throw new Error("cloud-ai-invalid-score");}
  const scoreAnswer=scoreData&&scoreData.choices&&scoreData.choices[0]&&scoreData.choices[0].message&&scoreData.choices[0].message.content;
  result.score=parseScore(scoreAnswer);
  return result;
 }
 function errorText(error){
  const message=error instanceof Error?error.message:String(error||"unknown-error");
  if(error&&error.name==="AbortError")return "AI phản hồi quá lâu (quá 30 giây).";
  if(message==="Failed to fetch")return "Không kết nối được Groq. Kiểm tra mạng hoặc CORS.";
  if(message==="cloud-ai-key-not-configured")return "Cloud AI chưa được cấu hình khóa API.";
  if(message.indexOf("cloud-ai-http-401:")===0)return "Groq từ chối khóa API (401).";
  if(message.indexOf("cloud-ai-http-403:")===0)return "Groq từ chối quyền truy cập (403).";
  if(message.indexOf("cloud-ai-http-429:")===0)return "Groq đã giới hạn số lượt gọi (429).";
  if(message.indexOf("cloud-ai-http-404:")===0)return "Groq không tìm thấy model hoặc endpoint (404).";
  if(message==="cloud-ai-invalid-response")return "Groq trả về dữ liệu không đúng định dạng phát hiện.";
  if(message==="cloud-ai-invalid-score")return "Groq không trả về đủ dữ liệu chấm điểm.";
  if(message.indexOf("cloud-ai-score-http-")===0)return "Groq lỗi khi chấm điểm ("+message.slice("cloud-ai-score-http-".length)+").";
  return "Cloud AI không trả về được phát hiện hợp lệ.";
 }
 window.kavanahRunCloudAi=function(contractText,contractType){
  return analyzeContractWithCloudAI(contractText,contractType).then(result=>{
   return result;
  }).catch(error=>{
   console.error("Cloud AI request failed:",error instanceof Error?error.message:String(error));
   return {findings:[],score:null,error:errorText(error)};
  });
 };
})();
