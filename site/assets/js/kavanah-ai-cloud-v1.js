(function(){
 "use strict";
 async function analyzeContractWithCloudAI(contractText){
  const GROQ_ENDPOINT="https://api.groq.com/openai/v1/chat/completions";
  const GROQ_API_KEY=window.KAVANAH_GROQ_API_KEY||"";
  const MODEL_NAME="openai/gpt-oss-20b";
  const systemPrompt=`Bạn là chuyên gia pháp lý rà soát hợp đồng lao động tại Việt Nam.
Hãy phân tích nội dung hợp đồng và chỉ ra:
1. Những điều khoản có dấu hiệu vi phạm hoặc bất lợi nghiêm trọng cho người lao động.
2. Những điều khoản mập mờ, thiếu minh bạch (lương, thưởng, bảo hiểm, phạt bồi thường).
3. Đề xuất điều chỉnh cụ thể.
Trả lời bằng tiếng Việt, gạch đầu dòng rõ ràng.
Không dùng ký tự "|" để ngăn cách các ý. Nếu cần tách nhiều ý, hãy dùng danh sách gạch đầu dòng hoặc đánh số.`;
  if(!GROQ_API_KEY)throw new Error("cloud-ai-key-not-configured");
  const response=await fetch(GROQ_ENDPOINT,{
   method:"POST",
   headers:{
    "Content-Type":"application/json",
    "Authorization":["Bearer",GROQ_API_KEY].join(" ")
   },
   body:JSON.stringify({
    model:MODEL_NAME,
    messages:[
     {role:"system",content:systemPrompt},
     {role:"user",content:String(contractText||"").trim()}
    ],
    temperature:.2
   })
  });
  let data;
  try{data=await response.json();}catch(error){throw new Error("cloud-ai-invalid-response");}
  if(!response.ok){
   const detail=data&&data.error&&data.error.message||response.statusText||"HTTP "+response.status;
   throw new Error("cloud-ai-http-"+response.status+": "+detail);
  }
  const answer=data&&data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content;
  if(typeof answer!=="string"||!answer.trim())throw new Error("cloud-ai-invalid-response");
  return answer.trim();
 }
 function appendInline(parent,text){
  const parts=String(text||"").split(/(\*\*[^*]+\*\*)/g);
  for(const part of parts){
   if(!part)continue;
   if(/^\*\*[^*]+\*\*$/.test(part)){
    const strong=document.createElement("strong");
    strong.textContent=part.slice(2,-2);
    parent.append(strong);
   }else parent.append(document.createTextNode(part));
  }
 }
 function renderAnswer(container,text){
  container.replaceChildren();
  const lines=String(text||"").replace(/\r\n?/g,"\n").split("\n").flatMap(rawLine=>{
   if(!rawLine.includes("|"))return [rawLine];
   const parts=rawLine.split("|").map(part=>part.trim()).filter(Boolean);
   if(!parts.length)return [];
   return parts.map((part,index)=>index?"- "+part:part);
  });
  let list=null,listType="";
  function closeList(){if(list){container.append(list);list=null;listType="";}}
  for(const rawLine of lines){
   const line=rawLine.trim();
   if(!line){closeList();continue;}
   const heading=line.match(/^\d+\.\s+\*\*(.+?)\*\*:?\s*$/);
   if(heading){
    closeList();
    const title=document.createElement("h4");title.textContent=heading[1];container.append(title);continue;
   }
   const bullet=line.match(/^[-*]\s+(.+)$/);
   const numbered=line.match(/^\d+[.)]\s+(.+)$/);
   if(bullet||numbered){
    const type=bullet?"ul":"ol";
    if(!list||listType!==type){closeList();list=document.createElement(type);listType=type;}
    const item=document.createElement("li");appendInline(item,(bullet?bullet[1]:numbered[1]).trim());list.append(item);continue;
   }
   closeList();
   const paragraph=document.createElement("p");appendInline(paragraph,line);container.append(paragraph);
  }
  closeList();
 }
 window.analyzeContractWithCloudAI=analyzeContractWithCloudAI;
 function init(){
  const input=document.getElementById("clause"),contractType=document.getElementById("contractType"),
   run=document.getElementById("runCheck"),runLabel=document.getElementById("runCheckLabel"),
   runSpinner=document.getElementById("runCheckSpinner"),box=document.getElementById("cloudAiBox"),
   consent=document.getElementById("cloudAiConsent"),result=document.getElementById("cloudAiResult");
  if(!input||!contractType||!run||!box||!consent||!result)return;
  let busy=false;
  function setRunLoading(loading){
   run.disabled=loading;
   run.setAttribute("aria-busy",String(loading));
   if(runLabel)runLabel.textContent=loading?"AI đang rà soát…":"Kiểm tra bằng luật + AI ↗";
   if(runSpinner)runSpinner.hidden=!loading;
  }
  function reset(){
   if(!busy)setRunLoading(false);
   box.hidden=true;result.textContent="AI chưa được chạy.";
  }
  run.addEventListener("click",()=>{
   if(contractType.value!=="labor"||!input.value.trim()||input.dataset.invalidContract==="true"){reset();return;}
   box.hidden=false;
   if(!consent.checked){result.textContent="Đã kiểm tra bằng luật.";return;}
   if(busy)return;
   busy=true;setRunLoading(true);
   const loading=document.createElement("span");loading.className="cloud-ai-loading";
   const spinner=document.createElement("span");spinner.className="cloud-ai-spinner";spinner.setAttribute("aria-hidden","true");
   loading.append(spinner,document.createTextNode("Đang rà soát bổ sung…"));result.replaceChildren(loading);
   analyzeContractWithCloudAI(input.value).then(answer=>{
    if(!consent.checked||box.hidden)return;
    const heading=document.createElement("strong");heading.textContent="Phát hiện bổ sung từ AI";
    const body=document.createElement("div");body.className="cloud-ai-answer";renderAnswer(body,answer);
    result.replaceChildren(heading,body);
   }).catch(error=>{
    const message=error instanceof Error?error.message:String(error||"unknown-error");
    console.error("Cloud AI request failed:",message);
    if(error&&error.name==="AbortError")result.textContent="AI phản hồi quá lâu. Kết quả luật vẫn được giữ.";
    else if(message==="Failed to fetch")result.textContent="Không kết nối được Groq. Kiểm tra Live Server, mạng hoặc CORS. Kết quả luật vẫn được giữ.";
    else if(message==="cloud-ai-key-not-configured")result.textContent="Cloud AI chưa được cấu hình khóa API. Kết quả luật vẫn được giữ.";
    else if(message.indexOf("cloud-ai-http-401:")===0)result.textContent="Groq từ chối khóa API (401). Khóa có thể sai, hết hạn hoặc đã bị thu hồi. Kết quả luật vẫn được giữ.";
    else if(message.indexOf("cloud-ai-http-403:")===0)result.textContent="Groq từ chối quyền truy cập (403). Kiểm tra quyền hoặc trạng thái tài khoản. Kết quả luật vẫn được giữ.";
    else if(message.indexOf("cloud-ai-http-429:")===0)result.textContent="Groq đã giới hạn số lượt gọi (429). Vui lòng thử lại sau. Kết quả luật vẫn được giữ.";
    else if(message.indexOf("cloud-ai-http-404:")===0)result.textContent="Groq không tìm thấy model hoặc endpoint (404). Kiểm tra tên model trong Groq Model Catalog. Kết quả luật vẫn được giữ.";
    else result.textContent="Cloud AI lỗi: "+message+" Kết quả luật vẫn được giữ.";
   }).finally(()=>{busy=false;setRunLoading(false);});
  });
  input.addEventListener("input",reset);
  contractType.addEventListener("change",reset);
  reset();
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
