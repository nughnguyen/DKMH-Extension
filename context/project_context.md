# Project Context: GumballZ Registration Ecosystem

## Mục tiêu Dự án
Xây dựng một công cụ hỗ trợ đăng ký môn học (DKMH) mạnh mẽ, tự động và có khả năng mở rộng tốt cho sinh viên các trường đại học tại Việt Nam. 

## Tính năng Hiện tại (Giai đoạn 1)
- **Extension Framework**: Hỗ trợ Manifest V3, cấu trúc module chia theo trường.
- **Auto-Login & Session**: Theo dõi và gửi heartbeat để duy trì kết nối.
- **Stealth**: Delays dạng con người, tránh bị bắt bot bởi tường lửa.
- **Web Portal**: Giới thiệu dự án, nhận Donate thông qua VietQR API.

## Lộ trình Phát triển (Giai đoạn 2 - Nâng cao)
- **Cloud Sync**: Liên kết với Firebase/Supabase để đồng bộ Môn học.
- **Crowdsources Status**: Hệ thống báo cáo trạng thái Server tự động bằng dữ liệu từ các người dùng kết nối.
- **Smart Schedule**: Trích xuất dữ liệu đăng ký thành công ra định dạng iCal/.ics.
- **Scheduled Start**: Đặt lịch Auto F5 và spam request ở một thời điểm chính xác (vd: 08:00:00 sáng).
- **Multi-Threading**: Sử dụng Web Workers để đa nhiệm qua các endpoints (cổng phụ) của hệ thống trường.

## Kiến trúc Mở rộng
Mỗi trường học mới sẽ được tạo trong `/prod/implementation/`, kế thừa các module từ `tasks` và `skills` để xử lý logic nội bộ. Controller tại `popup.js` / `background.js` sẽ định tuyến dựa trên Domain Website.
