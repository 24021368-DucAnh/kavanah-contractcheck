# Contributing

Cảm ơn bạn đã hỗ trợ KAVANAH ContractCheck AI.

## Quy tắc làm việc

- Không push trực tiếp vào `main`; làm việc trên branch riêng và mở Pull Request.
- Đặt tên branch rõ mục tiêu, ví dụ `feat/short-description`, `fix/short-description`, `docs/short-description`.
- Dùng commit message ngắn, có phạm vi: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- Không format lại hàng loạt hoặc sửa ngoài phạm vi task nếu không cần thiết.
- Mọi thay đổi trên website production phải qua review và đồng bộ thủ công sang WebsitePublisher. GitHub hiện chưa nối tự động với deployment.

## Trước khi mở Pull Request

- [ ] Mô tả mục tiêu và các file đã thay đổi.
- [ ] Kiểm tra HTML, CSS, JavaScript liên quan.
- [ ] Kiểm tra desktop và mobile nếu có thay đổi giao diện.
- [ ] Kiểm tra các luồng kiểm tra hợp đồng/tra cứu bị ảnh hưởng.
- [ ] Kiểm tra liên kết, fragment, asset path và thư viện bên ngoài.
- [ ] Không thêm API key, token, `.env`, hợp đồng thật, dữ liệu cá nhân hoặc answer key.
- [ ] Cập nhật tài liệu/hướng dẫn đồng bộ nếu quy trình thay đổi.
- [ ] Nêu rõ những gì chưa kiểm thử hoặc chưa thể kiểm thử.

## Pháp lý và nội dung

Khi sửa nội dung pháp luật, cần kiểm tra văn bản gốc, số điều/khoản/điểm, hiệu lực và thời điểm áp dụng. Không trình bày kết quả tự động như kết luận pháp lý chắc chắn. Nêu rõ giới hạn và nguồn tham khảo.

## Phạm vi nguồn

Thư mục `site/` là snapshot của WebsitePublisher, không phải bản build đã được xác nhận độc lập. Không giả định việc sửa file ở đây sẽ tự thay đổi website live.
