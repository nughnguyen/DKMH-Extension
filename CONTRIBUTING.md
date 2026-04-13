# Hướng Dẫn Đóng Góp (Contributing Guidelines)

Chào mừng bạn đến với dự án **GumballZ Registration Ecosystem**!
Chúng tôi thiết kế kiến trúc theo hướng Plug-and-Play để sinh viên từ bất kỳ trường Đại học nào cũng có thể tự phát triển Engine đăng ký cho trường của mình và chia sẻ cho cộng đồng.

## Cách tạo mới một Engine cho trường của bạn

1. Fork repository này về tài khoản GitHub của bạn.
2. Tạo một nhánh mới từ `develop` (VD: `feature/neu-engine`).
3. Đi đến thư mục `extension/prod/implementation/`.
4. Tạo một file Javascript mới mang tên trường của bạn, ví dụ: `neu_engine.js`.
5. Đảm bảo file được kế thừa (hoặc tuân theo cấu trúc interface) từ `base_engine.js` hoặc giao tiếp được qua Controller chính trong `popup.js` / `background.js`.
6. Tích hợp các module có sẵn tại thư mục `prod/tasks` và `prod/skills` (ví dụ sử dụng `SessionKeeper` hoặc `HumanDelay`).
7. Test kỹ càng trên môi trường thực tế (có dummy account hoặc dùng trong đợt đăng ký thật nếu tự tin).

## Quy trình gửi Pull Request (PR)

- Đảm bảo mã nguồn của bạn tuân thủ các quy tắc format chung.
- Cập nhật tài liệu (nếu cần thiết) trong file README.md hoặc project_context.md.
- Tạo PR nhắm vào nhánh `develop`.
- Thêm mô tả chi tiết: URL test của trường bạn, phương thức nhận dạng form, các issue tiềm ẩn.

Cảm ơn bạn đã chung tay giúp hàng ngàn sinh viên có một mùa đăng ký môn học "thảnh thơi"!
