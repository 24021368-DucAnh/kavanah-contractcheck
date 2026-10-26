# KAVANAH ContractCheck AI

**Tagline:** Hiểu hợp đồng. Nhận diện rủi ro. Tự tin ký kết.

Website: https://project29280.websitepublisher.ai/index.html  
Repository: https://github.com/24021368-DucAnh/kavanah-contractcheck

KAVANAH là website hỗ trợ người dùng rà soát một số dấu hiệu rủi ro trong hợp đồng lao động và tra cứu thông tin pháp luật. Phạm vi hiện tại có giới hạn; công cụ không thay thế luật sư hoặc tư vấn pháp lý chuyên nghiệp.

## Repository này chứa gì?

- `site/pages/`: snapshot HTML của ba trang đang được xuất bản.
- `site/assets/css/` và `site/assets/js/`: CSS/JavaScript hiện được các trang sử dụng.
- `site/assets/images/`: SVG nhận diện thương hiệu đang được tham chiếu.
- `site/fragments/`: HTML dùng chung cho header và footer.
- `docs/source-snapshot.md`: phiên bản/hash nguồn đã lấy từ WebsitePublisher.
- `docs/websitepublisher-sync.md`: quy trình đồng bộ giữa GitHub và WebsitePublisher.

## Quan trọng: GitHub chưa tự deploy website

Đây là **snapshot nguồn để cộng tác**, không phải pipeline CI/CD. Push hoặc merge vào GitHub **không tự cập nhật** website đang chạy trên WebsitePublisher. Xem [quy trình đồng bộ](docs/websitepublisher-sync.md) trước khi phát hành thay đổi.

HTML hiện vẫn dùng include directive của WebsitePublisher (`<!--#wps-include fragment="..." -->`) và một số thư viện/CDN bên ngoài; vì vậy không nên coi bản sao trong repo là website standalone chạy độc lập ngay lập tức.

## Làm việc nhóm

1. Tạo branch riêng từ `main`.
2. Chỉnh sửa trong `site/` và cập nhật tài liệu nếu cần.
3. Mở Pull Request, mô tả thay đổi và cách kiểm tra.
4. Chỉ sau khi review/merge mới đồng bộ thủ công sang WebsitePublisher theo tài liệu.

Xem [CONTRIBUTING.md](CONTRIBUTING.md).

## Bảo mật và dữ liệu

- Không commit API key, token, mật khẩu, file `.env`, dữ liệu hợp đồng thật, thông tin cá nhân của khách hàng hoặc answer key của bộ hợp đồng demo.
- Không đưa nội dung hợp đồng riêng tư vào issue, PR, log hoặc fixture công khai.
- Website đang dùng cấu hình secret trong WebsitePublisher Vault; giá trị secret không thuộc repository.
- Repo đang để **Public**, nên mọi file được commit đều có thể được người khác đọc.

## License

Chưa thêm license. Public visibility **không đồng nghĩa** với việc cấp phép cho người khác sử dụng, sao chép hoặc phân phối mã nguồn.
