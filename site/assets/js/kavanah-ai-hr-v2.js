(function(){
"use strict";
const allowedCodes=new Set(["probation-pay","original-documents","resignation-payment","overtime-pay"]);
const topicWords={
  "probation-pay":/(?:lương|thử\s+việc)/iu,
  "original-documents":/(?:bản\s+chính|bản\s+gốc|giấy\s+tờ|văn\s+bằng|chứng\s+chỉ|tốt\s+nghiệp)/iu,
  "resignation-payment":/(?:bồi\s+thường|nghỉ\s+việc|chấm\s+dứt|đào\s+tạo)/iu,
  "overtime-pay":/(?:làm\s+thêm|tăng\s+ca|giờ\s+làm|thời\s+giờ)/iu
};
function makePlanMessage(findings){
  if(!Array.isArray(findings)||!findings.length)throw Error("missing-findings");
  const codes=[];
  for(const item of findings){
    if(!item||typeof item.id!=="string"||!allowedCodes.has(item.id))throw Error("invalid-risk-code");
    if(!codes.includes(item.id))codes.push(item.id);
  }
  if(codes.length<1||codes.length>4)throw Error("invalid-risk-count");
  return "risk_codes: "+codes.join(",");
}
function parsePlan(reply,expectedCodes){
  if(!Array.isArray(expectedCodes)||expectedCodes.length<1||expectedCodes.length>4||
    new Set(expectedCodes).size!==expectedCodes.length||expectedCodes.some(c=>!allowedCodes.has(c)))throw Error("invalid-expected");
  const raw=String(reply||"").trim();
  if(raw.length>2100)throw Error("excessive-response");
  const data=JSON.parse(raw.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/, ""));
  if(!data||Array.isArray(data)||Object.keys(data).length!==1||!Array.isArray(data.steps))throw Error("wrong-schema");
  if(data.steps.length!==expectedCodes.length)throw Error("missing-or-extra-steps");
  const safeSteps=[];
  for(let i=0;i<data.steps.length;i++){
    const step=data.steps[i];
    if(!step||Array.isArray(step)||Object.keys(step).sort().join(",")!=="action,risk_code"||
      step.risk_code!==expectedCodes[i]||typeof step.action!=="string")throw Error("wrong-step");
    const action=step.action.trim();
    if(action.length<25||action.length>220||!topicWords[step.risk_code].test(action)||
       /https?:\/\/|<[^>]*>|(?:điều|khoản|nghị\s+định)\s*\d+|chắc\s+chắn\s+vi\s+phạm|vi\s+phạm\s+pháp\s+luật|(?:bỏ\s+qua|không\s+cần)\s+(?:luật|đọc|kiểm\s+tra)|(?:ký\s+ngay|chuyển\s+tiền|thanh\s+toán\s+ngay)/iu.test(action))throw Error("unsafe-step");
    safeSteps.push({risk_code:step.risk_code,action});
  }
  return safeSteps;
}
if(typeof module!=="undefined"&&module.exports)module.exports={makePlanMessage,parsePlan};
if(typeof document==="undefined")return;
function init(){
  const box=document.getElementById("aiHrBox"),input=document.getElementById("clause"),
    select=document.getElementById("aiRiskCode"),consent=document.getElementById("aiHrConsent"),
    button=document.getElementById("aiHrAsk"),result=document.getElementById("aiHrResult"),
    planButton=document.getElementById("aiPlanAsk"),planResult=document.getElementById("aiPlanResult"),
    run=document.getElementById("runCheck"),contractType=document.getElementById("contractType");
  if(!box||!input||!select||!consent||!button||!result||!planButton||!planResult||!run||!contractType)return;
  const allowed=allowedCodes;
  let current=[],busy=false;
  const show=(label,body)=>{
    result.replaceChildren();
    const p=document.createElement("p");
    const strong=document.createElement("strong");strong.textContent=label+" ";
    p.append(strong,document.createTextNode(body||""));
    result.append(p);
  };
  function reset(){box.hidden=true;consent.checked=false;button.disabled=true;planButton.disabled=true;select.replaceChildren();result.replaceChildren();planResult.replaceChildren();current=[];}
  function sync(){button.disabled=!consent.checked||!allowed.has(select.value)||busy;planButton.disabled=!consent.checked||!current.length||busy;}
  function refresh(){
    reset();
    if(contractType.value!=="labor"||!window.KavanahCheck||!input.value.trim())return;
    let analysis;
    try{analysis=window.KavanahCheck.analyze(input.value);}catch(e){return;}
    const byId=new Map();
    for(const f of analysis.findings||[]){if(allowed.has(f.id)&&!byId.has(f.id))byId.set(f.id,f);}
    if(!byId.size)return;
    current=Array.from(byId.values());
    current.forEach(f=>{
      const option=document.createElement("option");option.value=f.id;option.textContent=f.title;select.append(option);
    });
    box.hidden=false;sync();
  }
  run.addEventListener("click",refresh);
  input.addEventListener("input",reset);
  contractType.addEventListener("change",reset);
  select.addEventListener("change",()=>{result.replaceChildren();sync();});
  consent.addEventListener("change",sync);
  planButton.addEventListener("click",async()=>{
    if(busy||!consent.checked||!current.length)return;
    let message,codes;
    try{
      message=makePlanMessage(current);
      codes=message.slice("risk_codes: ".length).split(",");
    }catch(e){planResult.textContent="Không thể xác định danh sách dấu hiệu hợp lệ. Vui lòng chạy lại kiểm tra.";return;}
    busy=true;sync();planButton.textContent="Đang chuẩn bị…";
    planResult.textContent="Đang tạo danh sách từ mã dấu hiệu. Không gửi nội dung hợp đồng.";
    try{
      if(!window.WP||typeof window.WP.sapi!=="function")throw Error("site-ai-unavailable");
      const response=await window.WP.sapi(29280).execute("site-assistant","chat",{
        assistant_key:"kavanah-plan",message,history:[]
      });
      const payload=response&&response.data&&response.data.success?response.data.result:null;
      if(!payload||payload.limited||typeof payload.reply!=="string")throw Error("provider-unavailable");
      const steps=parsePlan(payload.reply,codes);
      if(!consent.checked||box.hidden||makePlanMessage(current)!==message)return;
      const heading=document.createElement("strong");heading.textContent="AI gợi ý thứ tự cần trao đổi:";
      const ol=document.createElement("ol");
      for(const step of steps){const li=document.createElement("li");li.textContent=step.action;ol.append(li);}
      planResult.replaceChildren(heading,ol);
    }catch(error){
      if(!box.hidden&&makePlanMessage(current)===message){
        const heading=document.createElement("strong");heading.textContent="Gợi ý có sẵn để trao đổi:";
        const ol=document.createElement("ol");
        current.forEach(f=>{const li=document.createElement("li");li.textContent=f.question;ol.append(li);});
        planResult.replaceChildren(heading,ol);
      }
    }finally{busy=false;planButton.textContent="AI gợi ý các bước tiếp theo";sync();}
  });
  button.addEventListener("click",async()=>{
    if(busy||!consent.checked||!allowed.has(select.value))return;
    const risk=current.find(f=>f.id===select.value);
    if(!risk)return;
    const code=risk.id;
    busy=true;sync();button.textContent="Đang tạo câu hỏi…";
    show("Trạng thái:","Đang liên hệ AI. Chỉ mã loại dấu hiệu được gửi đi.");
    try{
      if(!window.WP||typeof window.WP.sapi!=="function")throw new Error("site-ai-unavailable");
      const sapi=window.WP.sapi(29280);
      if(!sapi||typeof sapi.execute!=="function")throw new Error("site-ai-unavailable");
      const response=await sapi.execute("site-assistant","chat",{
        assistant_key:"kavanah-explain",message:"risk_code: "+code,history:[]
      });
      const payload=response&&response.data&&response.data.success?response.data.result:null;
      if(!payload||payload.limited||typeof payload.reply!=="string")throw new Error("provider-unavailable");
      const raw=payload.reply.trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"");
      const data=JSON.parse(raw);
      if(!data||Object.keys(data).length!==1||typeof data.ask_hr!=="string")throw new Error("wrong-schema");
      const answer=data.ask_hr.replace(/KAVANAH/gi,"công ty").trim();
      if(answer.length<25||answer.length>215||!answer.endsWith("?")
       ||/https?:\/\/|<[^>]*>|(?:Điều|Khoản|Nghị\s+định)\s*\d+|(?:\d{2,}\s*%)/iu.test(answer))throw new Error("invalid-answer");
      if(!consent.checked||select.value!==code||box.hidden)return;
      show("Câu hỏi AI gợi ý:",answer);
    }catch(error){
      if(!box.hidden&&select.value===code){
        show("Không thể xác minh câu trả lời AI.","Có thể dùng câu hỏi đã được biên tập: "+risk.question);
      }
    }finally{
      busy=false;button.textContent="Gợi ý thêm bằng AI";sync();
    }
  });
  reset();
}
if(document.readyState==="complete")init();else window.addEventListener("load",init,{once:true});
})();

