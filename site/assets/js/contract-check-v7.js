(function(root){
"use strict";
const LAW="https://congbaocdn.chinhphu.vn/180507251028987904/2026/3/5/468971-1772684381_v1_1772690833_signed.pdf";
const RULES={
 "probation-pay":{title:"Lương thử việc thấp hơn mốc luật định",severity:"critical",level:"Dấu hiệu nghiêm trọng · Có thể trái Điều 26 Bộ luật Lao động",basis:"Điều 26 Bộ luật Lao động — lương thử việc ít nhất bằng 85% lương của công việc.",sourceUrl:LAW+"#page=11",question:"Vì sao hợp đồng ghi lương thử việc thấp hơn 85% lương công việc, và công ty sẽ sửa điều khoản này thế nào?",uncertainty:"Cần kiểm tra phụ lục và cách trả lương thực tế; phép đối chiếu dựa trên tỷ lệ ghi trong điều khoản."},
 "original-documents":{title:"Công ty giữ giấy tờ bản chính",severity:"critical",level:"Dấu hiệu nghiêm trọng · Có thể trái Điều 17 Bộ luật Lao động",basis:"Khoản 1 Điều 17 Bộ luật Lao động — người sử dụng lao động không được giữ bản chính giấy tờ tùy thân, văn bằng, chứng chỉ.",sourceUrl:LAW+"#page=8",question:"Công ty có thể bỏ yêu cầu giữ bản chính và chỉ đối chiếu rồi trả lại ngay không?",uncertainty:"Cần kiểm tra điều khoản áp dụng trên thực tế; cảnh báo dựa trên yêu cầu giữ bản chính được ghi trong hợp đồng."},
 "resignation-payment":{title:"Khoản bồi thường cố định khi nghỉ việc",severity:"medium",level:"Rủi ro đáng chú ý · Cần đối chiếu",basis:"Điều 35, Điều 40 và Điều 62 Bộ luật Lao động — cần phân biệt quyền nghỉ việc, trường hợp chấm dứt trái pháp luật và chi phí đào tạo có căn cứ.",sourceUrl:LAW+"#page=15",question:"Khoản tiền này áp dụng trong trường hợp nào, dựa trên nghĩa vụ nào và có chứng từ chi phí đào tạo không?",uncertainty:"Chưa thể kết luận nghĩa vụ bồi thường từ một câu; cần kiểm tra thỏa thuận đào tạo và hoàn cảnh chấm dứt."},
 "salary-deduction":{title:"Khấu trừ lương để phạt hoặc bồi thường rộng",severity:"high",level:"Cảnh báo cao · Có dấu hiệu cần đối chiếu Điều 102, 127 Bộ luật Lao động",basis:"Điều 102 chỉ cho khấu trừ tiền lương trong trường hợp bồi thường thiệt hại theo luật và có giới hạn; Điều 127 cấm phạt tiền hoặc cắt lương thay xử lý kỷ luật.",sourceUrl:LAW,question:"Khoản khấu trừ cụ thể là bồi thường thiệt hại nào, được xác định và giới hạn theo căn cứ nào?",uncertainty:"Cần phân biệt bồi thường thiệt hại có căn cứ với tiền phạt hoặc khấu trừ tùy ý; kiểm tra chứng từ và mức khấu trừ thực tế."},
 "overtime-consent":{title:"Làm thêm không cần sự đồng ý",severity:"high",level:"Cảnh báo cao · Có dấu hiệu cần đối chiếu Điều 107 Bộ luật Lao động",basis:"Điều 107 quy định việc làm thêm giờ về nguyên tắc cần có sự đồng ý của người lao động, trừ một số trường hợp luật định.",sourceUrl:LAW+"#page=40",question:"Công ty ghi nhận sự đồng ý của người lao động cho từng đợt làm thêm như thế nào?",uncertainty:"Cần kiểm tra có thuộc trường hợp ngoại lệ luật định hay không và hồ sơ đồng ý trên thực tế."},
 "overtime-limit":{title:"Thời giờ làm thêm không có giới hạn rõ",severity:"high",level:"Cảnh báo cao · Có dấu hiệu cần đối chiếu Điều 107 Bộ luật Lao động",basis:"Điều 107 quy định giới hạn giờ làm thêm theo ngày, tháng, năm và một số ngoại lệ cụ thể.",sourceUrl:LAW+"#page=40",question:"Giới hạn giờ làm thêm theo ngày, tháng, năm và ngoại lệ áp dụng được quy định ở đâu?",uncertainty:"Cần kiểm tra số giờ dự kiến, nhóm ngành và ngoại lệ luật định; điều khoản đơn lẻ chưa cho biết cách tổ chức thực tế."},
 "unilateral-contract-change":{title:"Công ty có thể tự thay đổi nội dung hợp đồng",severity:"medium",level:"Rủi ro cần đối chiếu · Thay đổi điều khoản hợp đồng",basis:"Điều 33 Bộ luật Lao động quy định sửa đổi, bổ sung hợp đồng dựa trên thỏa thuận của hai bên; nếu không thỏa thuận được thì tiếp tục thực hiện hợp đồng đã giao kết.",sourceUrl:LAW+"#page=14",question:"Thay đổi lương, địa điểm hoặc chế độ sẽ được hai bên thỏa thuận và ghi nhận bằng cách nào?",uncertainty:"Cần xem chính sách, phụ lục và cách áp dụng thực tế; đây là dấu hiệu cần đối chiếu, chưa phải kết luận vi phạm."},

 "work-location-transfer":{title:"Điều chuyển địa điểm làm việc trên phạm vi rộng",severity:"medium",level:"Rủi ro cần đối chiếu · Điều kiện điều chuyển",basis:"Điều 21 Bộ luật Lao động yêu cầu làm rõ địa điểm làm việc; việc thay đổi nội dung đã thỏa thuận cần xem xét theo Điều 33 và tình huống thực tế. Đây không phải kết luận việc điều chuyển luôn trái luật.",sourceUrl:LAW+"#page=10",sourceUrlSecondary:LAW+"#page=14",question:"Trường hợp nào công ty có thể điều chuyển sang tỉnh khác, có cần thỏa thuận với người lao động, báo trước bao lâu và hỗ trợ chi phí ra sao?",uncertainty:"Phải kiểm tra hợp đồng, phụ lục, địa điểm đã thỏa thuận, căn cứ pháp luật và sự đồng ý thực tế; không tự động kết luận vi phạm."},
 "post-employment-restriction":{title:"Hạn chế làm việc cho đối thủ sau khi nghỉ",severity:"medium",level:"Rủi ro cần đối chiếu · Phạm vi hạn chế cạnh tranh",basis:"Khoản 2 Điều 21 Bộ luật Lao động đề cập thỏa thuận bảo vệ bí mật kinh doanh, bí mật công nghệ; không vì thế mà mặc nhiên xác nhận hiệu lực của mọi điều khoản cấm cạnh tranh sau nghỉ việc.",sourceUrl:LAW+"#page=10",question:"Những doanh nghiệp, loại công việc và thông tin bí mật nào thực sự bị hạn chế, thời hạn và phạm vi áp dụng có thể thu hẹp không?",uncertainty:"Hiệu lực của thỏa thuận hạn chế cạnh tranh cần đánh giá riêng theo quan hệ lao động, bí mật được bảo vệ, phạm vi và tình tiết cụ thể; chưa thể kết luận chỉ từ điều khoản."},
 "overtime-pay":{title:"Cách tính lương làm thêm chưa rõ",severity:"low",level:"Cần làm rõ",basis:"Điều 98 và Điều 107 Bộ luật Lao động — cần kiểm tra điều kiện làm thêm và mức trả lương theo loại ngày.",sourceUrl:LAW+"#page=40",question:"Quy chế công ty quy định tỷ lệ trả lương nào và việc làm thêm có cần sự đồng ý của người lao động không?",uncertainty:"Tỷ lệ có thể đã được ghi trong phụ lục hoặc quy chế chưa được cung cấp."}
};
function partsOf(raw){
 const text=String(raw||"").replace(/\r\n?/g,"\n").trim();
 if(!text)return [];
 const starts=[...text.matchAll(/^\s*Điều\s+\d+\s*[.:]/gim)].map(m=>m.index);
 if(starts.length>1){
  const starts2=starts[0]>0?[0,...starts]:starts;
  return starts2.map((start,i)=>text.slice(start,starts2[i+1]||text.length).trim()).filter(Boolean);
 }
 return text.split(/\n\s*\n+/).map(p=>p.trim()).filter(Boolean);
}
function quote(block,focus){
 let start=0;
 if(block.length>430){
  start=Math.max(0,focus.index-130);
  if(focus.index+focus[0].length>start+430)start=Math.max(0,focus.index+focus[0].length-430);
  start=Math.min(start,block.length-430);
 }
 const excerpt=block.slice(start,start+430).trim();
 return (start?"…":"")+excerpt+(start+430<block.length?"…":"");
}
function finding(id,block,focus){
 const rule=RULES[id];
 let basis=rule.basis;
 if(id==="probation-pay"){
  const salary=/(?:mức\s+)?lương\s+(?:của\s+)?công\s+việc\s+là\s+([\d.,]+)\s*đồng/iu.exec(block.replace(/\s/g," "));
  const rate=Number(focus[1].replace(",","."));
  if(salary&&rate>=0&&rate<85){
   const amount=Number(salary[1].replace(/\D/g,""));
   if(amount>=1000000&&amount<=1000000000){
    const fmt=n=>new Intl.NumberFormat("vi-VN",{maximumFractionDigits:0}).format(Math.round(n));
    basis+=" Với lương công việc "+fmt(amount)+" đồng/tháng ghi tại đây, "+rate+"% là "+fmt(amount*rate/100)+" đồng; 85% là "+fmt(amount*.85)+" đồng.";
   }
  }
 }
 return {id,title:rule.title,severity:rule.severity,level:rule.level,quote:quote(block,focus),basis,sourceUrl:rule.sourceUrl,sourceUrlSecondary:rule.sourceUrlSecondary||null,question:rule.question,uncertainty:rule.uncertainty};
}
function originalDocMatch(block){
 const pattern=/(?:lưu\s+giữ|giữ|nộp|giao)[^.!?\n]{0,100}(?:bản\s+chính|bản\s+gốc)[^.!?\n]{0,90}(?:giấy\s+tờ|văn\s+bằng|bằng\s+tốt\s+nghiệp|chứng\s+chỉ)/giu;
 for(const match of block.matchAll(pattern)){
  const prior=block.slice(0,match.index).split(/[.!?\n]/u).pop();
  if(!/không\s+(?:(?:được|phải|cần)(?:\s+phép)?\s+)?$/iu.test(prior))return match;
 }
 return null;
}
function lowProbationMatch(block){
 const pattern=/(?:lương\s+thử\s+việc|thử\s+việc(?:\s+(?:(?:được|sẽ)\s+)?(?:hưởng|trả|nhận))?|tiền\s+lương\s+(?:trong\s+)?thời\s+gian\s+thử\s+việc|(?:trong\s+)?thời\s+gian\s+thử\s+việc)[^.!?\n]{0,120}?(\d{1,3}(?:[.,]\d+)?)\s*%\s*(?:mức\s+)?lương(?:\s+của)?\s+công\s+việc/giu;
 for(const match of block.matchAll(pattern)){
  const percent=Number(match[1].replace(",","."));
  const prior=block.slice(Math.max(0,match.index-48),match.index);
  if(percent>=0&&percent<85&&!/không\s+(?:được\s+)?(?:hưởng|trả|bằng)(?:\s+lương\s+thử\s+việc)?\s*(?:bằng\s*)?$/iu.test(prior))return match;
 }
 return null;
}
function analyze(raw){
 const text=String(raw||"").trim(),all=[];
 function record(id,block,match){all.push(finding(id,block,match));}
 if(!text)return {scannedChars:0,findings:[],totalFindings:0,omittedFindings:0,severityCounts:{high:0,medium:0,low:0},note:"Chưa có văn bản hợp đồng để kiểm tra."};
 for(const block of partsOf(text)){
  // PDF extractors can insert line breaks inside sentences. Replace each whitespace
  // code unit with one space so matching crosses wraps without shifting excerpt offsets.
  const searchable=block.replace(/\s/g," ");
  const probation=lowProbationMatch(searchable);
  if(probation)record("probation-pay",block,probation);
  const document=originalDocMatch(searchable);
  if(document)record("original-documents",block,document);
  const resignation=/(?:nghỉ\s+việc|chấm\s+dứt)[\s\S]{0,250}bồi\s+thường[^.;\n]{0,120}\d[\d.,]*(?:\s*(?:nghìn|triệu|tỷ))?\s*đồng[\s\S]{0,100}(?:trong\s+)?mọi\s+trường\s+hợp/iu.exec(searchable);
  if(resignation)record("resignation-payment",block,resignation);
  const overtime=/(?:làm\s+thêm\s+giờ|tăng\s+ca)/iu.exec(searchable);
  if(overtime&&/theo\s+quy\s+chế(?:\s+riêng)?(?:\s+của)?\s+công\s+ty/iu.test(searchable)&&!/(?:150|200|300)\s*%/u.test(searchable))record("overtime-pay",block,overtime);

  const deduction=/(?:khấu\s+trừ|trừ\s+(?:vào\s+)?lương)/iu.exec(searchable);
  if(deduction&&/(?:mọi\s+khoản|mọi\s+thiệt\s+hại|phạt\s+tiền|phí\s+quản\s+lý|công\s+ty\s+xác\s+định|tùy\s+ý)/iu.test(searchable)
     &&!/(?:không\s+(?:được\s+)?(?:khấu\s+trừ|trừ\s+lương)|chỉ\s+được\s+khấu\s+trừ)/iu.test(searchable))
     record("salary-deduction",block,deduction);

  const noConsent=/(?:làm\s+thêm(?:\s+giờ)?|tăng\s+ca)[^.!?;]{0,100}(?:không\s+cần\s+(?:xác\s+nhận\s+)?(?:sự\s+)?đồng\s+ý|không\s+cần\s+người\s+lao\s+động\s+đồng\s+ý)/iu.exec(searchable);
  if(noConsent)record("overtime-consent",block,noConsent);
  const unlimited=/(?:làm\s+thêm(?:\s+giờ)?|tăng\s+ca)[^.!?;]{0,100}(?:không\s+giới\s+hạn|vô\s+hạn)/iu.exec(searchable);
  if(unlimited)record("overtime-limit",block,unlimited);
  const includedOvertime=/(?:tiền\s+)?lương\s+(?:làm\s+thêm|tăng\s+ca)[^.!?;]{0,80}(?:đã\s+)?bao\s+gồm\s+trong\s+(?:mức\s+)?lương/iu.exec(searchable);
  if(includedOvertime&&!overtime)record("overtime-pay",block,includedOvertime);

  const unilateral=/(?:mặc\s+nhiên\s+chấp\s+thuận|công\s+ty\s+(?:đơn\s+phương\s+)?(?:quyết\s+định|được\s+quyền\s+thay\s+đổi)[^.!?;]{0,100}(?:lương|địa\s+điểm|chế\s+độ|nội\s+dung\s+hợp\s+đồng)|(?:lương|địa\s+điểm|chế\s+độ)[^.!?;]{0,100}theo\s+(?:chính\s+sách|quy\s+định)\s+(?:do\s+)?công\s+ty\s+ban\s+hành\s+từng\s+thời\s+kỳ)/iu.exec(searchable);
  if(unilateral)record("unilateral-contract-change",block,unilateral);

  // Trigger only for unilateral out-of-province moves; ordinary flexible work is not enough.
  const relocation=/(?:điều\s+chuyển|chuyển\s+nơi\s+làm\s+việc)[\s\S]{0,110}(?:sang\s+địa\s+điểm\s+làm\s+việc\s+tại\s+)?(?:tỉnh\s*,?\s*thành\s+phố\s+khác|tỉnh\s+khác|địa\s+phương\s+khác)[\s\S]{0,115}(?:nhu\s+cầu|thông\s+báo\s+trước|không\s+cần\s+đồng\s+ý)/iu.exec(searchable)
   ||/(?:điều\s+chuyển)[\s\S]{0,80}(?:tỉnh\s*,?\s*thành\s+phố\s+khác|tỉnh\s+khác|địa\s+phương\s+khác)/iu.exec(searchable);
  if(relocation&&!/(?:không\s+được|không\s+thể|chỉ\s+khi\s+được\s+đồng\s+ý)\s*(?:tự\s+ý\s+)?(?:điều\s+chuyển|chuyển)/iu.test(searchable.slice(Math.max(0,relocation.index-50),relocation.index+50))
     &&/(?:thông\s+báo\s+trước|nhu\s+cầu\s+dự\s+án|không\s+cần\s+đồng\s+ý|theo\s+quyết\s+định)/iu.test(searchable))
     record("work-location-transfer",block,relocation);
  // Only broad post-employment restrictions; not confidentiality while employed.
  const noncompete=/(?:\d{1,2}\s*tháng\s+sau\s+khi\s+(?:chấm\s+dứt|nghỉ\s+việc)|sau\s+khi\s+(?:chấm\s+dứt|nghỉ\s+việc)[\s\S]{0,50}\d{1,2}\s*tháng)[\s\S]{0,110}không\s+được\s+(?:làm\s+việc|gia\s+nhập)[\s\S]{0,160}(?:bất\s+kỳ\s+doanh\s+nghiệp|mọi\s+doanh\s+nghiệp|doanh\s+nghiệp[\s\S]{0,75}cạnh\s+tranh)/iu.exec(searchable);
  if(noncompete&&/(?:cạnh\s+tranh|đối\s+thủ)/iu.test(noncompete[0])&&!/(?:không\s+áp\s+dụng|được\s+miễn)\s*$/iu.test(searchable.slice(Math.max(0,noncompete.index-30),noncompete.index)))
     record("post-employment-restriction",block,noncompete);

 }
 const severityCounts={critical:0,high:0,medium:0,low:0};
 all.forEach(f=>severityCounts[f.severity]++);
 const rank={critical:0,high:1,medium:2,low:3};
 all.sort((a,b)=>rank[a.severity]-rank[b.severity]);
 const findings=all.slice(0,12),totalFindings=all.length;
 return {scannedChars:text.length,findings,totalFindings,omittedFindings:totalFindings-findings.length,severityCounts,note:totalFindings?"Đây là các dấu hiệu theo quy tắc đang hỗ trợ; mức cảnh báo không phải kết luận pháp lý cuối cùng.":"Không thấy dấu hiệu theo phạm vi kiểm tra hiện có; điều này không chứng minh hợp đồng hợp pháp hoặc an toàn."};
}
const api={analyze};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.KavanahCheck=api;
})(typeof window!=="undefined"?window:globalThis);


