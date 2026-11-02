(function(){
"use strict";
const $=id=>document.getElementById(id),input=$("clause"),contractType=$("contractType"),report=$("checkReport"),summary=$("checkSummary"),list=$("checkFindings"),download=$("downloadCheck"),printButton=$("printCheck");
const runButton=$("runCheck"),runLabel=$("runCheckLabel"),runSpinner=$("runCheckSpinner"),progress=$("checkProgress"),progressStatus=$("checkProgressStatus");
const steps=progress?[...progress.querySelectorAll("[data-check-step]")]:[];
let last=null,busy=false,runToken=0;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function stage(index){
 steps.forEach((step,i)=>{
  step.classList.toggle("is-current",i===index);
  step.classList.toggle("is-complete",i<index);
  if(i===index)step.setAttribute("aria-current","step");else step.removeAttribute("aria-current");
 });
 if(progressStatus)progressStatus.textContent=steps[index]?.dataset.checkStep||"";
}
function stopProgress(){
 busy=false;runButton.disabled=false;runButton.removeAttribute("aria-busy");
 runLabel.textContent="Kiểm tra bằng luật ↗";runSpinner.hidden=true;progress.hidden=true;
}
function invalidate(){runToken++;if(busy)stopProgress();}
if(printButton){printButton.disabled=true;printButton.addEventListener("click",()=>{if(last&&!report.hidden&&typeof window.print==="function")window.print();});}
const severityPanel=$("severityPanel");
function renderSeverityPanel(data){
 if(!severityPanel)return;
 severityPanel.replaceChildren();
 const listOfFindings=data.findings||[];
 if(!data.totalFindings){severityPanel.hidden=true;return;}
 severityPanel.hidden=false;
 const counts=data.severityCounts||{
  critical:0,
  high:0,
  medium:listOfFindings.filter(f=>f.kind==="legal").length,
  low:listOfFindings.filter(f=>f.kind==="negotiation").length
 };
 const overview=document.createElement("div");overview.className="severity-overview";
 const groups=[
  {code:"critical",name:"Nghiêm trọng",description:"Có thể trái quy định bắt buộc",count:counts.critical},
  {code:"high",name:"Cảnh báo cao",description:"Cần kiểm tra căn cứ hoặc ngoại lệ",count:counts.high},
  {code:"medium",name:"Cần rà soát",description:"Đối chiếu trước khi đồng ý",count:counts.medium},
  {code:"low",name:"Cần làm rõ",description:"Câu chữ chưa cụ thể",count:counts.low}
 ];
 for(const item of groups){
  const section=document.createElement("div");section.className="severity-overview-item severity-overview-"+item.code;
  const number=document.createElement("strong");number.textContent=String(item.count||0);
  const text=document.createElement("div");text.className="severity-overview-copy";
  const title=document.createElement("span");title.textContent=item.name;
  const description=document.createElement("small");description.textContent=item.description;
  text.append(title,description);section.append(number,text);overview.append(section);
 }
 const controls=document.createElement("div");controls.className="severity-filters";
 controls.setAttribute("role","group");controls.setAttribute("aria-label","Lọc kết quả theo mức cảnh báo");
 const feedback=document.createElement("p");feedback.className="severity-filter-feedback";
 feedback.setAttribute("role","status");feedback.setAttribute("aria-live","polite");
 const options=[{code:"all",name:"Tất cả"},...groups];
 const buttons=[];
 function applyFilter(code){
  let shown=0;
  list.querySelectorAll(".screen-finding").forEach(card=>{
   const visible=code==="all"||card.classList.contains("screen-finding-"+code);
   card.hidden=!visible;if(visible)shown++;
  });
  buttons.forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.severity===code)));
  feedback.textContent="Hiển thị "+shown+" / "+listOfFindings.length+" phát hiện được liệt kê."+(data.omittedFindings?" Còn "+data.omittedFindings+" phát hiện chưa liệt kê trong báo cáo.":"")+" Lọc không ảnh hưởng tệp kết quả tải về.";
 }
 for(const option of options){
  const button=document.createElement("button");button.type="button";button.className="severity-filter-button";
  button.dataset.severity=option.code;button.textContent=option.name;
  button.setAttribute("aria-pressed",String(option.code==="all"));
  if(option.code!=="all"&&!(groups.find(g=>g.code===option.code)?.count))button.disabled=true;
  button.addEventListener("click",()=>applyFilter(option.code));
  controls.append(button);buttons.push(button);
 }
 severityPanel.append(overview,controls,feedback);
 // Result cards are appended immediately after this function returns.
 requestAnimationFrame(()=>{if(!severityPanel.hidden&&last===data)applyFilter("all");});
}

function p(label,value,cls){
 const node=document.createElement("p");if(cls)node.className=cls;
 if(label){const b=document.createElement("strong");b.textContent=label+" ";node.append(b);}
 node.append(document.createTextNode(value));return node;
}
function isLikelyContract(text,type){
 const normalized=String(text||"").toLowerCase();
 if(normalized.length<120)return false;
 const common=[/(?:hợp\s*đồng|thỏa\s*thuận)/u,/(?:bên\s+a|bên\s+b|bên\s+1|bên\s+2)/u,/(?:điều\s+\d+|quyền\s+và\s+nghĩa\s+vụ|điều khoản)/u];
 const labor=[/(?:người\s+lao\s+động|nhân\s+viên|người\s+sử\s+dụng\s+lao\s+động|công\s+ty)/u,/(?:mức\s+lương|tiền\s+lương|thử\s+việc|thời\s+giờ\s+làm\s+việc|nghỉ\s+việc)/u];
 const commercial=[/(?:mua\s+bán|cung\s+cấp|dịch\s+vụ|hàng\s+hóa|giao\s+hàng)/u,/(?:giá\s+trị|thanh\s+toán|nghiệm\s+thu|bồi\s+thường|phạt\s+vi\s+phạm)/u];
 const matches=patterns=>patterns.reduce((count,pattern)=>count+(pattern.test(normalized)?1:0),0);
 return matches(common)>=2&&matches(type==="commercial"?commercial:labor)>=1;
}
function appendFindingCard(f){
 const severity=f.severity||"medium";
 const card=document.createElement("article");card.className="screen-finding screen-finding-"+severity;
 card.setAttribute("aria-label",f.level?f.level+": "+f.title:f.title);
 const head=document.createElement("header");head.className="screen-finding-head";
 const tag=document.createElement("span");tag.className="screen-tag";tag.textContent=f.level||"Rủi ro cần đối chiếu";
 const heading=document.createElement("h4");heading.textContent=f.title;head.append(tag,heading);
 const evidence=document.createElement("section");evidence.className="screen-evidence";
 const evidenceLabel=document.createElement("span");evidenceLabel.className="screen-field-label";evidenceLabel.textContent="TRÍCH ĐOẠN LIÊN QUAN";
 const quote=document.createElement("blockquote");quote.className="screen-quote";quote.textContent=String(f.quote||"").trim();
 evidence.append(evidenceLabel,quote);
 const basis=document.createElement("section");basis.className="screen-basis";
 const basisLabel=document.createElement("span");basisLabel.className="screen-field-label";basisLabel.textContent="CĂN CỨ ĐỐI CHIẾU";
 const basisText=document.createElement("p");basisText.textContent=f.basis||"";basis.append(basisLabel,basisText);
 const sources=document.createElement("div");sources.className="screen-sources";
 if(f.sourceUrl){const link=document.createElement("a");link.href=f.sourceUrl;link.target="_blank";link.rel="noopener noreferrer";link.textContent="Đối chiếu điều luật chính thức ↗";sources.append(link);}
 if(f.sourceUrlSecondary){const secondary=document.createElement("a");secondary.href=f.sourceUrlSecondary;secondary.target="_blank";secondary.rel="noopener noreferrer";secondary.textContent="Điều 33 ↗";sources.append(secondary);}
 const review=document.createElement("div");review.className="screen-review";
 const limit=document.createElement("section");limit.className="screen-review-item screen-limit";
 const limitLabel=document.createElement("span");limitLabel.className="screen-field-label";limitLabel.textContent="CẦN XÁC MINH";
 const limitText=document.createElement("p");limitText.textContent=f.uncertainty||"Đây là nhận định tự động, cần đối chiếu với toàn bộ hợp đồng và quy định hiện hành.";limit.append(limitLabel,limitText);
 const ask=document.createElement("section");ask.className="screen-review-item screen-question";
 const askLabel=document.createElement("span");askLabel.className="screen-field-label";askLabel.textContent="CÂU HỎI GỢI Ý";
 const askText=document.createElement("p");askText.textContent=f.question||"";ask.append(askLabel,askText);
 review.append(limit,ask);card.append(head,evidence,basis,sources,review);list.append(card);
}
function renderScorePanel(score){
 const panel=document.getElementById("contractScore");
 if(!panel||!score||!Array.isArray(score.criteria))return;
 const normalizeScore=value=>{
  const numeric=Number(value);
  if(!Number.isFinite(numeric))return NaN;
  return numeric>9?numeric/100*9:numeric;
 };
 const overall=normalizeScore(score.overall);
 if(!Number.isFinite(overall))return;
 panel.replaceChildren();panel.hidden=false;
 const title=document.createElement("h4");title.id="contractScoreTitle";title.textContent="Điểm chất lượng hợp đồng";
 const translateLabel=value=>({
  poor:"Cần cải thiện",average:"Trung bình",fair:"Khá",good:"Tốt",excellent:"Xuất sắc"
 }[String(value||"").trim().toLowerCase()]||String(value||"Mức đánh giá tổng quát"));
 const translateCriterion=value=>({
  clarity:"Tính rõ ràng","legal compliance":"Tuân thủ pháp luật","salary compliance":"Tuân thủ về lương",
  "working hours":"Thời giờ làm việc","leave entitlements":"Quyền nghỉ phép",completeness:"Tính đầy đủ",
  "contract duration":"Thời hạn hợp đồng",benefits:"Phúc lợi","risk control":"Kiểm soát rủi ro",
  professionalism:"Tính chuyên nghiệp"
 }[String(value||"").trim().toLowerCase()]||String(value||"Tiêu chí"));
 const overallBox=document.createElement("div");overallBox.className="contract-score-overall";
 const number=document.createElement("strong");number.textContent=Math.max(0,Math.min(9,overall)).toFixed(1)+"/9";
 const label=document.createElement("span");label.textContent="Tổng điểm · "+translateLabel(score.label);
 overallBox.append(number,label);
 const intro=document.createElement("p");intro.textContent="Đánh giá riêng bằng AI theo 6 tiêu chí. Điểm tham khảo, không phải kết luận pháp lý.";
 const chart=document.createElement("div");chart.className="contract-score-chart";
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 360 330");svg.setAttribute("role","img");svg.setAttribute("aria-label","Biểu đồ lục giác điểm chất lượng hợp đồng");
 const center={x:180,y:155},radius=95;
 const points=score.criteria.slice(0,6).map((item,index)=>{
  const angle=-Math.PI/2+index*Math.PI/3;
  return {x:center.x+radius*Math.cos(angle),y:center.y+radius*Math.sin(angle),item,angle};
 });
 function polygon(level,className){
  const node=document.createElementNS("http://www.w3.org/2000/svg","polygon");
  node.setAttribute("class",className);
  node.setAttribute("fill","none");node.setAttribute("stroke","#D8D2C6");node.setAttribute("stroke-width","1");
  node.setAttribute("points",points.map(point=>{
   const scale=level/9;
   return (center.x+(point.x-center.x)*scale)+","+(center.y+(point.y-center.y)*scale);
  }).join(" "));
  return node;
 }
 [3,6,9].forEach(level=>svg.append(polygon(level,"contract-score-grid")));
 points.forEach(point=>{
  const line=document.createElementNS("http://www.w3.org/2000/svg","line");line.setAttribute("class","contract-score-axis");line.setAttribute("x1",center.x);line.setAttribute("y1",center.y);line.setAttribute("x2",point.x);line.setAttribute("y2",point.y);svg.append(line);
 });
 const values=points.map(point=>Math.max(0,Math.min(9,normalizeScore(point.item.score)||0)));
 const valuePolygon=document.createElementNS("http://www.w3.org/2000/svg","polygon");valuePolygon.setAttribute("class","contract-score-value");valuePolygon.setAttribute("fill","#E8D8BD");valuePolygon.setAttribute("fill-opacity","0.55");valuePolygon.setAttribute("stroke","#A47A42");valuePolygon.setAttribute("stroke-width","2");valuePolygon.setAttribute("points",points.map((point,index)=>{
  const scale=values[index]/9;return (center.x+(point.x-center.x)*scale)+","+(center.y+(point.y-center.y)*scale);
 }).join(" "));svg.append(valuePolygon);
 points.forEach((point,index)=>{
  const dot=document.createElementNS("http://www.w3.org/2000/svg","circle");const scale=values[index]/9;
  dot.setAttribute("class","contract-score-dot");dot.setAttribute("cx",center.x+(point.x-center.x)*scale);dot.setAttribute("cy",center.y+(point.y-center.y)*scale);dot.setAttribute("r","4");svg.append(dot);
  const labelNode=document.createElementNS("http://www.w3.org/2000/svg","text");labelNode.setAttribute("class","contract-score-label");labelNode.setAttribute("fill","#526870");labelNode.setAttribute("font-size","9");labelNode.setAttribute("font-family","Be Vietnam Pro, sans-serif");labelNode.setAttribute("x",center.x+(point.x-center.x)*1.25);labelNode.setAttribute("y",center.y+(point.y-center.y)*1.25);labelNode.setAttribute("text-anchor",point.x<center.x-10?"end":point.x>center.x+10?"start":"middle");labelNode.textContent=translateCriterion(point.item.name);svg.append(labelNode);
 });
 chart.append(svg);
 const criteria=document.createElement("div");criteria.className="contract-score-criteria";
 score.criteria.slice(0,6).forEach(item=>{
  const row=document.createElement("article");row.className="contract-score-criterion";
  const head=document.createElement("div");head.className="contract-score-criterion-head";
  const name=document.createElement("strong");name.textContent=translateCriterion(item.name);
  const itemScore=normalizeScore(item.score);const value=document.createElement("span");
  value.textContent=(Number.isFinite(itemScore)?Math.max(0,Math.min(9,itemScore)).toFixed(1):"—")+"/9";
  head.append(name,value);
  const reason=document.createElement("p");reason.textContent=String(item.reason||"Chưa có lý do cụ thể.");
  row.append(head,reason);criteria.append(row);
 });
 panel.append(title,overallBox,intro,chart,criteria);
}
window.kavanahAppendAiFindings=function(findings,score){
 if(!last)return;
 if(!Array.isArray(findings))findings=[];
 last.score=score||null;
 const valid=findings.filter(f=>f&&typeof f.title==="string"&&f.title.trim()).map(f=>{
  const severity=["critical","high","medium","low"].includes(f.severity)?f.severity:"medium";
  return Object.assign({},f,{severity,level:f.level||"AI · Cần đối chiếu",kind:"legal"});
 });
 last.findings.push(...valid);last.totalFindings=last.findings.length;last.omittedFindings=0;
 last.severityCounts={
  critical:last.findings.filter(f=>f.severity==="critical").length,
  high:last.findings.filter(f=>f.severity==="high").length,
  medium:last.findings.filter(f=>f.severity==="medium").length,
  low:last.findings.filter(f=>f.severity==="low").length
 };
 valid.forEach(appendFindingCard);
 renderScorePanel(score);
 renderSeverityPanel(last);
 summary.textContent="Đã đọc "+new Intl.NumberFormat("vi-VN").format(last.scannedChars)+" ký tự. Tìm thấy "+last.totalFindings+" dấu hiệu, gồm luật cứng và AI; "+last.severityCounts.critical+" nghiêm trọng, "+last.severityCounts.high+" cảnh báo cao, "+last.severityCounts.medium+" cần rà soát, "+last.severityCounts.low+" cần làm rõ.";
};
function renderHardFindings(){
 const counts=last.severityCounts||{critical:0,high:0,medium:last.findings.filter(f=>f.kind==="legal").length,low:last.findings.filter(f=>f.kind==="negotiation").length};
 summary.textContent="Đã đọc "+new Intl.NumberFormat("vi-VN").format(last.scannedChars)+" ký tự. "+(last.totalFindings?"Tìm thấy "+last.totalFindings+" dấu hiệu: "+counts.critical+" nghiêm trọng, "+counts.high+" cảnh báo cao, "+counts.medium+" cần rà soát, "+counts.low+" cần làm rõ. ":"")+ (last.omittedFindings?"Hiển thị "+last.findings.length+" dấu hiệu ưu tiên; còn "+last.omittedFindings+" dấu hiệu chưa liệt kê. ":"")+last.note;
 renderSeverityPanel(last);
 last.findings.forEach(appendFindingCard);
}
function showAiLoading(){
 summary.replaceChildren();
 const spinner=document.createElement("span");spinner.className="cloud-ai-spinner";spinner.setAttribute("aria-hidden","true");
 summary.append(spinner,document.createTextNode(" Đang phân tích bằng AI và đồng bộ với kết quả luật cứng…"));
}
function run(){
 $("samplePanel").classList.remove("active");$("toolMessage").classList.remove("active");
 report.hidden=false;list.replaceChildren();last=null;const scorePanel=document.getElementById("contractScore");if(scorePanel){scorePanel.hidden=true;scorePanel.replaceChildren();}if(printButton)printButton.disabled=true;if(severityPanel)severityPanel.hidden=true;
 if(!input.value.trim()){summary.textContent="Hãy tải hợp đồng hoặc dán nội dung trước khi kiểm tra.";download.disabled=true;return;}
 if(!isLikelyContract(input.value,contractType.value)){
  input.dataset.invalidContract="true";
  summary.textContent="Đây không phải một loại hợp đồng hợp lệ hoặc nội dung chưa đủ thông tin để kiểm tra. Vui lòng kiểm tra lại văn bản và chọn đúng loại hợp đồng.";
  download.disabled=true;
  if(printButton)printButton.disabled=true;
  return;
 }
 input.dataset.invalidContract="false";
 const checker=contractType.value==="commercial"?window.KavanahCommercialCheck:window.KavanahCheck;
 if(!checker){summary.textContent="Bộ kiểm tra chưa tải xong. Vui lòng tải lại trang và thử lại.";download.disabled=true;return;}
 last=checker.analyze(input.value);download.disabled=false;if(printButton)printButton.disabled=false;
 showAiLoading();
 const cloudRun=window.kavanahRunCloudAi;
 if(cloudRun){
  const runButton=$("runCheck"),runLabel=$("runCheckLabel"),runSpinner=$("runCheckSpinner");
  runButton.disabled=true;runButton.setAttribute("aria-busy","true");if(runLabel)runLabel.textContent="AI đang rà soát…";if(runSpinner)runSpinner.hidden=false;
  cloudRun(input.value,contractType.value).then(result=>{
   const score=result&&result.score;
   const validScore=score&&Number.isFinite(Number(score.overall))&&Array.isArray(score.criteria)&&score.criteria.length>=6;
   if(!validScore){
    const message=result&&result.error||"AI chưa trả về đủ dữ liệu chấm điểm.";
    summary.textContent=message+" Kết quả luật cứng chưa hiển thị vì đang chờ đồng bộ AI.";
    runButton.disabled=false;runButton.setAttribute("aria-busy","false");if(runLabel)runLabel.textContent="Kiểm tra hợp đồng ↗";if(runSpinner)runSpinner.hidden=true;
    return;
   }
   renderHardFindings();
   if(typeof window.kavanahAppendAiFindings==="function")window.kavanahAppendAiFindings(result.findings,score);
   runButton.disabled=false;runButton.setAttribute("aria-busy","false");if(runLabel)runLabel.textContent="Kiểm tra hợp đồng ↗";if(runSpinner)runSpinner.hidden=true;
  });
 }
 report.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
}
$("runCheck").addEventListener("click",run);
input.addEventListener("input",()=>{report.hidden=true;last=null;const scorePanel=document.getElementById("contractScore");if(scorePanel)scorePanel.hidden=true;if(printButton)printButton.disabled=true;if(severityPanel)severityPanel.hidden=true;});
contractType.addEventListener("change",()=>{report.hidden=true;last=null;download.disabled=true;const scorePanel=document.getElementById("contractScore");if(scorePanel)scorePanel.hidden=true;if(printButton)printButton.disabled=true;if(severityPanel)severityPanel.hidden=true;});
download.addEventListener("click",()=>{
 if(!last)return;
 const counts=last.severityCounts||{high:0,medium:last.findings.filter(f=>f.kind==="legal").length,low:last.findings.filter(f=>f.kind==="negotiation").length};
 const rows=["KAVANAH — KIỂM TRA SƠ BỘ HỢP ĐỒNG","Loại hợp đồng: "+(contractType.value==="commercial"?"Thương mại":"Lao động"),"Kiểm tra sơ bộ theo các dấu hiệu đang hỗ trợ; không phải AI hoặc kết luận pháp lý.","CẢNH BÁO: Báo cáo này có thể chứa trích đoạn hợp đồng và thông tin cá nhân. Không chia sẻ công khai.","","Số ký tự đã đọc: "+last.scannedChars,"Tổng số dấu hiệu: "+last.totalFindings,"Dấu hiệu nghiêm trọng: "+counts.critical,"Cảnh báo cao: "+counts.high,"Cần rà soát: "+counts.medium,"Cần làm rõ: "+counts.low,"Số dấu hiệu được liệt kê: "+last.findings.length,"Số dấu hiệu chưa liệt kê: "+last.omittedFindings,last.note,""];
 if(last.score){
  rows.push("CHẤM ĐIỂM AI","Tổng điểm: "+last.score.overall+"/9 — "+(last.score.label||""),"");
  (last.score.criteria||[]).forEach(item=>rows.push(String(item.name||"Tiêu chí")+": "+item.score+"/9",String(item.reason||""),""));
 }
 last.findings.forEach((f,i)=>rows.push((i+1)+". ["+(f.severity?f.level:(f.kind==="legal"?"Rủi ro đáng chú ý · Cần đối chiếu":"Cần làm rõ"))+"] "+f.title,"Đoạn hợp đồng: "+f.quote,(f.kind==="negotiation"?"Ý nghĩa: ":"Căn cứ: ")+f.basis,...(f.sourceUrl?["Nguồn: "+f.sourceUrl]:[]),...(f.sourceUrlSecondary?["Nguồn đối chiếu Điều 33: "+f.sourceUrlSecondary]:[]),"Giới hạn đánh giá: "+f.uncertainty,"Nên hỏi: "+f.question,""));
 const url=URL.createObjectURL(new Blob([rows.join("\n")],{type:"text/plain;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="kavanah-kiem-tra-so-bo.txt";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
})();
