# GitHub ↔ WebsitePublisher sync

## Trạng thái hiện tại

- Website production: https://project29280.websitepublisher.ai/index.html
- WebsitePublisher project ID: `29280`
- GitHub repo: https://github.com/24021368-DucAnh/kavanah-contractcheck
- GitHub branch dùng để nhập snapshot: `codex/import-websitepublisher-source`
- Cơ chế triển khai tự động: **chưa được cấu hình**.

**GitHub là nơi review và lưu lịch sử source; WebsitePublisher vẫn là nơi đang xuất bản website.** Push/merge GitHub không tự triển khai.

## Cấu trúc snapshot

- `site/pages/*.html`: nội dung HTML trang.
- `site/fragments/*.html`: fragment dùng chung.
- `site/assets/css/*.css`, `site/assets/js/*.js`, `site/assets/images/*.svg`: các asset được đưa vào snapshot.

Các trang chứa directive như:

```html
<!--#wps-include fragment="kavanah-header" -->
```

WebsitePublisher xử lý directive này. Nếu preview HTML trực tiếp ngoài nền tảng, fragment có thể không được render. Một số script/styles cũng tải từ CDN, bao gồm thư viện bên ngoài như PDF.js và Mammoth.

## Quy trình thay đổi an toàn

1. Tạo branch từ `main`; không sửa trực tiếp `main`.
2. Sửa đúng file trong `site/`; giữ các thay đổi nhỏ và tập trung.
3. Kiểm tra source diff, asset path, fragment, nội dung pháp lý và các luồng bị ảnh hưởng.
4. Mở PR để người khác review. Chưa merge nếu chưa hiểu rõ ảnh hưởng.
5. Sau khi PR được duyệt/merge, người chịu trách nhiệm phát hành cần **đồng bộ thủ công** những file thay đổi vào đúng page, asset hoặc fragment trong WebsitePublisher.
6. Kiểm tra trang live trên desktop/mobile, console/network nếu có thể, các luồng chính và liên kết.
7. Ghi lại phiên bản/hash WebsitePublisher mới vào `docs/source-snapshot.md` hoặc commit cập nhật tiếp theo.

## Phát hành và rollback

- Không coi merge GitHub là phát hành production.
- Không sửa WebsitePublisher production chỉ bằng cách giả định file GitHub đã được đồng bộ.
- Nếu bản phát hành có lỗi, dùng lịch sử phiên bản của đúng page/asset/fragment trong WebsitePublisher để khôi phục, sau đó đồng bộ lại source GitHub để tránh lệch hai bên.
- Trước khi thiết lập CI/CD, cần xác định cơ chế export/import chính thức, xử lý fragment và asset, secret management, môi trường staging và bước xác nhận phát hành. Không tự thêm pipeline triển khai khi chưa kiểm chứng được đường triển khai an toàn.

## Dữ liệu không được đưa lên repo

Không commit secret, API key, token, dữ liệu hợp đồng thật, thông tin cá nhân, bản hợp đồng demo nội bộ hoặc answer key. Repo hiện Public; hãy coi toàn bộ lịch sử commit là có thể đọc công khai.
