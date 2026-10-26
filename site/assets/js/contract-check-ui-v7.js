(function(){
"use strict";
const $=id=>document.getElementById(id),input=$("clause"),contractType=$("contractType"),report=$("checkReport"),summary=$("checkSummary"),list=$("checkFindings"),download=$("downloadCheck"),printButton=$("printCheck");
let last=null;
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
function run(){
 $("samplePanel").classList.remove("active");$("toolMessage").classList.remove("active");
 report.hidden=false;list.replaceChildren();last=null;if(printButton)printButton.disabled=true;if(severityPanel)severityPanel.hidden=true;
 if(!input.value.trim()){summary.textContent="Hãy tải hợp đồng hoặc dán nội dung trước khi kiểm tra.";download.disabled=true;return;}
 const checker=contractType.value==="commercial"?window.KavanahCommercialCheck:window.KavanahCheck;
 if(!checker){summary.textContent="Bộ kiểm tra chưa tải xong. Vui lòng tải lại trang và thử lại.";download.disabled=true;return;}
 last=checker.analyze(input.value);download.disabled=false;if(printButton)printButton.disabled=false;
 const counts=last.severityCounts||{critical:0,high:0,medium:last.findings.filter(f=>f.kind==="legal").length,low:last.findings.filter(f=>f.kind==="negotiation").length};
 summary.textContent="Đã đọc "+new Intl.NumberFormat("vi-VN").format(last.scannedChars)+" ký tự. "+(last.totalFindings?"Tìm thấy "+last.totalFindings+" dấu hiệu: "+counts.critical+" nghiêm trọng, "+counts.high+" cảnh báo cao, "+counts.medium+" cần rà soát, "+counts.low+" cần làm rõ. ":"")+(last.omittedFindings?"Hiển thị "+last.findings.length+" dấu hiệu ưu tiên; còn "+last.omittedFindings+" dấu hiệu chưa liệt kê. ":"")+last.note;
 renderSeverityPanel(last);
 last.findings.forEach(f=>{
  const severity=f.severity||(f.kind==="legal"?"medium":"low");
  const card=document.createElement("article");card.className="screen-finding screen-finding-"+severity;
  card.setAttribute("aria-label",f.level?f.level+": "+f.title:f.title);
  const head=document.createElement("header");head.className="screen-finding-head";
  const tag=document.createElement("span");tag.className="screen-tag";tag.textContent=f.severity?f.level:(f.kind==="legal"?"Rủi ro đáng chú ý · Cần đối chiếu":"Cần làm rõ");
  const heading=document.createElement("h4");heading.textContent=f.title;head.append(tag,heading);
  const evidence=document.createElement("section");evidence.className="screen-evidence";
  const evidenceLabel=document.createElement("span");evidenceLabel.className="screen-field-label";evidenceLabel.textContent="TRÍCH ĐOẠN LIÊN QUAN";
  const quote=document.createElement("blockquote");quote.className="screen-quote";
  quote.textContent=String(f.quote||"").replace(/(?:^|\n)\s*BẢN GIẢ ĐỊNH\s*[·•].*(?=\n|$)/gim,"").trim();
  evidence.append(evidenceLabel,quote);
  const basis=document.createElement("section");basis.className="screen-basis";
  const basisLabel=document.createElement("span");basisLabel.className="screen-field-label";basisLabel.textContent=f.kind==="negotiation"?"Ý NGHĨA":"CĂN CỨ ĐỐI CHIẾU";
  const basisText=document.createElement("p");basisText.textContent=f.basis||"";basis.append(basisLabel,basisText);
  const sources=document.createElement("div");sources.className="screen-sources";
  if(f.sourceUrl){const link=document.createElement("a");link.href=f.sourceUrl;link.target="_blank";link.rel="noopener noreferrer";link.textContent="Đối chiếu điều luật chính thức ↗";sources.append(link);}
  if(f.sourceUrlSecondary){const secondary=document.createElement("a");secondary.href=f.sourceUrlSecondary;secondary.target="_blank";secondary.rel="noopener noreferrer";secondary.textContent="Điều 33 ↗";sources.append(secondary);}
  const review=document.createElement("div");review.className="screen-review";
  const limit=document.createElement("section");limit.className="screen-review-item screen-limit";
  const limitLabel=document.createElement("span");limitLabel.className="screen-field-label";limitLabel.textContent="CẦN XÁC MINH";
  const limitText=document.createElement("p");limitText.textContent=f.uncertainty||"";limit.append(limitLabel,limitText);
  const ask=document.createElement("section");ask.className="screen-review-item screen-question";
  const askLabel=document.createElement("span");askLabel.className="screen-field-label";askLabel.textContent="CÂU HỎI GỢI Ý";
  const askText=document.createElement("p");askText.textContent=f.question||"";ask.append(askLabel,askText);
  review.append(limit,ask);card.append(head,evidence,basis,sources,review);list.append(card);
 });
 report.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
}
$("runCheck").addEventListener("click",run);
input.addEventListener("input",()=>{report.hidden=true;last=null;if(printButton)printButton.disabled=true;if(severityPanel)severityPanel.hidden=true;});
contractType.addEventListener("change",()=>{report.hidden=true;last=null;download.disabled=true;if(printButton)printButton.disabled=true;if(severityPanel)severityPanel.hidden=true;$("aiHrBox").hidden=true;$("aiHrConsent").checked=false;});
download.addEventListener("click",()=>{
 if(!last)return;
 const counts=last.severityCounts||{high:0,medium:last.findings.filter(f=>f.kind==="legal").length,low:last.findings.filter(f=>f.kind==="negotiation").length};
 const rows=["KAVANAH — KIỂM TRA SƠ BỘ HỢP ĐỒNG","Loại hợp đồng: "+(contractType.value==="commercial"?"Thương mại":"Lao động"),"Kiểm tra sơ bộ theo các dấu hiệu đang hỗ trợ; không phải AI hoặc kết luận pháp lý.","CẢNH BÁO: Báo cáo này có thể chứa trích đoạn hợp đồng và thông tin cá nhân. Không chia sẻ công khai.","","Số ký tự đã đọc: "+last.scannedChars,"Tổng số dấu hiệu: "+last.totalFindings,"Dấu hiệu nghiêm trọng: "+counts.critical,"Cảnh báo cao: "+counts.high,"Cần rà soát: "+counts.medium,"Cần làm rõ: "+counts.low,"Số dấu hiệu được liệt kê: "+last.findings.length,"Số dấu hiệu chưa liệt kê: "+last.omittedFindings,last.note,""];
 last.findings.forEach((f,i)=>rows.push((i+1)+". ["+(f.severity?f.level:(f.kind==="legal"?"Rủi ro đáng chú ý · Cần đối chiếu":"Cần làm rõ"))+"] "+f.title,"Đoạn hợp đồng: "+f.quote,(f.kind==="negotiation"?"Ý nghĩa: ":"Căn cứ: ")+f.basis,...(f.sourceUrl?["Nguồn: "+f.sourceUrl]:[]),...(f.sourceUrlSecondary?["Nguồn đối chiếu Điều 33: "+f.sourceUrlSecondary]:[]),"Giới hạn đánh giá: "+f.uncertainty,"Nên hỏi: "+f.question,""));
 const url=URL.createObjectURL(new Blob([rows.join("\n")],{type:"text/plain;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="kavanah-kiem-tra-so-bo.txt";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
})();

