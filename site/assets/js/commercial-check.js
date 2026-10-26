(function(root){
"use strict";
const LAW="https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/9/113-vbhn-vpqh.pdf#page=76";
const RULES=[
 {id:"commercial-unilateral-change",title:"Một bên tự thay đổi điều kiện",re:/đơn\s+phương\s+thay\s+đổi[^.;\n]{0,80}(?:không\s+cần|khỏi\s+cần)[^.;\n]{0,40}đồng\s+ý/iu,question:"Giá hoặc điều kiện nào được đổi, báo trước bao lâu và bên kia có quyền từ chối không?"},
 {id:"commercial-auto-renewal",title:"Gia hạn khi không phản hồi",re:/tự\s+động\s+gia\s+hạn[^.;\n]{0,100}(?:nếu|trừ\s+khi)[^.;\n]{0,80}(?:không\s+báo|không\s+thông\s+báo)/iu,question:"Ngày cuối để từ chối gia hạn là khi nào và cách thông báo nào được chấp nhận?"},
 {id:"commercial-liability-exclusion",title:"Miễn trách nhiệm rất rộng",re:/không\s+chịu\s+(?:bất\s+kỳ\s+)?trách\s+nhiệm[^.;\n]{0,100}(?:mọi|bất\s+kỳ)\s+thiệt\s+hại/iu,question:"Những thiệt hại và trường hợp nào vẫn phải chịu trách nhiệm?"},
 {id:"commercial-ip-assignment",title:"Chuyển cả tài sản trí tuệ có trước",re:/(?:toàn\s+bộ|mọi)\s+quyền\s+sở\s+hữu\s+trí\s+tuệ[^.;\n]{0,120}(?:kể\s+cả|bao\s+gồm)[^.;\n]{0,70}(?:có\s+trước|trước\s+hợp\s+đồng)/iu,question:"Tài sản có trước và sản phẩm tạo mới được phân định thế nào?"},
 {id:"commercial-deemed-acceptance",title:"Nghiệm thu mặc nhiên trong thời gian ngắn",re:/(?:coi\s+là|mặc\s+nhiên)\s+nghiệm\s+thu[^.;\n]{0,100}không\s+phản\s+hồi[^.;\n]{0,60}\d+\s*(?:giờ|ngày)/iu,question:"Bên nhận có bao lâu và cách nào để ghi nhận lỗi trước khi nghiệm thu?"},
 {id:"commercial-one-sided-forum",title:"Một bên chọn nơi giải quyết tranh chấp",re:/tranh\s+chấp[^.;\n]{0,110}trọng\s+tài\s+do\s+bên\s+[AB]\s+chỉ\s+định/iu,question:"Cơ quan giải quyết tranh chấp được hai bên thống nhất theo cơ chế nào?"},
 {id:"commercial-overbroad-confidentiality",title:"Bảo mật cả thông tin công khai",re:/bảo\s+mật\s+vĩnh\s+viễn[^.;\n]{0,80}(?:kể\s+cả|bao\s+gồm)[^.;\n]{0,50}thông\s+tin\s+công\s+khai/iu,question:"Có thể giới hạn loại thông tin, ngoại lệ công khai và thời hạn bảo mật không?"}
];
const PENALTY=/(?:phạt\s+vi\s+phạm|mức\s+phạt|chịu\s+phạt)[^.;\n]{0,100}?(\d{1,3}(?:[,.]\d+)?)\s*%[^.;\n]{0,100}?giá\s+trị\s+phần\s+nghĩa\s+vụ\s+hợp\s+đồng\s+bị\s+vi\s+phạm/giu;
function partsOf(text){
 const starts=[...text.matchAll(/^\s*Điều\s+\d+\s*[.:]/gim)].map(m=>m.index);
 if(starts.length>1){const all=starts[0]>0?[0,...starts]:starts;return all.map((start,i)=>text.slice(start,all[i+1]||text.length).trim()).filter(Boolean);}
 return text.split(/\n\s*\n+/u).map(s=>s.trim()).filter(Boolean);
}
function excerpt(block,match){
 let start=0;if(block.length>430)start=Math.min(block.length-430,Math.max(0,match.index-130));
 const value=block.slice(start,start+430).trim();return (start?"…":"")+value+(start+430<block.length?"…":"");
}
function analyze(raw){
 const text=String(raw||"").replace(/\r\n?/g,"\n").trim();
 const findings=[];let totalFindings=0;
 for(const block of partsOf(text)){
  const searchable=block.replace(/\s/g," ");
  for(const match of searchable.matchAll(PENALTY)){
   if(Number(match[1].replace(",","."))<=8)continue;
   const prior=searchable.slice(0,match.index).split(/[.!?;\n]/u).pop();
   if(/(?:không\s+áp\s+dụng|không\s+thu|không\s+được|miễn)\s*$/iu.test(prior))continue;
   totalFindings++;
   if(findings.length<12)findings.push({id:"commercial-penalty-over-eight",kind:"legal",title:"Mức phạt cần đối chiếu Điều 301",level:"Cần rà soát",quote:excerpt(block,match),basis:"Điều 301 Luật Thương mại: mức phạt không quá 8% giá trị phần nghĩa vụ bị vi phạm, trừ trường hợp Điều 266.",sourceUrl:LAW,question:"Giao dịch này thuộc Luật Thương mại và có ngoại lệ Điều 266 không?",uncertainty:"Chưa xác minh phạm vi áp dụng, giá trị nghĩa vụ thực tế và toàn bộ hồ sơ."});
  }
  for(const rule of RULES){
   const match=rule.re.exec(searchable);if(!match)continue;
   totalFindings++;
   if(findings.length<12)findings.push({id:rule.id,kind:"negotiation",title:rule.title,level:"Nên làm rõ",quote:excerpt(block,match),basis:"Điểm cần thương lượng; chưa có căn cứ để xác định vi phạm pháp luật.",sourceUrl:null,question:rule.question,uncertainty:"Chưa xác minh toàn bộ hợp đồng và bối cảnh giao dịch."});
  }
 }
 return {scannedChars:text.length,findings,totalFindings,omittedFindings:Math.max(0,totalFindings-findings.length),note:totalFindings?"Đây là điểm cần rà soát; không phải phân tích AI toàn hợp đồng hay kết luận pháp lý.":"Không thấy dấu hiệu theo phạm vi kiểm tra thương mại hiện có; điều này không chứng minh hợp đồng hợp pháp hoặc an toàn."};
}
const api={analyze};if(typeof module!=="undefined"&&module.exports)module.exports=api;root.KavanahCommercialCheck=api;
})(typeof window!=="undefined"?window:globalThis);

