# GumballZ Registration Ecosystem

![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![Manifest](https://img.shields.io/badge/Manifest-V3-orange?style=flat-square)

> **Công cụ hỗ trợ đăng ký môn học (tín chỉ) tự động cho sinh viên Đại học.**
> *Chú ý: Extension không lưu trữ mật khẩu người dùng. Không phát sinh rủi ro pháp lý với hệ thống dữ liệu của cổng thông tin nhà trường.*

**Người sáng lập & Phát triển: Nguyễn Quốc Hưng - EIU Student**

---

## Tính năng nổi bật

- **Kiến trúc Đa Engine (Plug-and-Play)**: Mỗi trường học (VD: EIU, TDMU, HUFLIT,...) được lập trình dưới dạng một module `_engine.js` chuyên biệt. Khi truy cập vào cổng đăng ký, Tiện ích sẽ phát hiện nền tảng và nạp Engine tương ứng theo thời gian thực.
- **Tự Động Đăng Nhập (Auto-Login)**: Xóa tan rào cản văng lỗi Authentication, luôn luôn đăng nhập và giữ Session sống liên tục.
- **Stealth Mode (Delay giả lập)**: Thuật toán nghỉ ngẫu nhiên mô phỏng hành vi thao tác của tay người thật để lách Hệ thống Tường Lửa (WAF).
- **Thiết Kế Chuẩn Claymorphism**: Từ Web Portal (Landing Page) cho đến bảng Extension UI đều được tân trang đồng nhất cấu trúc thiết kế 3D bong bóng sang trọng, hiện đại.
- **Donation Động**: Tích hợp mã QR chuẩn VietQR gen động theo mức giá người dùng chọn.

---

## Các trường hiện đang tương thích

Hệ thống có tự động render dữ liệu qua file cấu hình tổng. Một số trường nổi bật:

| Tên | Trường Học | Module Engine | Trạng thái |
|--------|--------|-----------|-----------|
| EIU | ĐH Quốc tế Miền Đông (Eastern International University) | `eiu_engine.js` | Active |
| TDMU | ĐH Thủ Dầu Một (Thu Dau Mot University) | `tdmu_engine.js` | Beta |
| HUFLIT | ĐH Ngoại ngữ - Tin học TP.HCM | `huflit_engine.js` | Beta |
| TDTU | ĐH Tôn Đức Thắng | Đang nghiên cứu | Soon |

---

## Cài đặt sử dụng

### 1. Tải Source Code (Clone):
```bash
git clone https://github.com/nughnguyen/DKMH-Extension.git
```

### 2. Kích hoạt Tiện ích trên Chrome/Edge
- Truy cập vào thanh URL: `chrome://extensions/`
- Bật **Chế độ dành cho nhà phát triển (Developer Mode)** ở góc trên của màn.
- Bấm nút xám **Tải tiện ích đã giải nén (Load unpacked)**.
- Chọn thư mục **`extension`** nằm trực tiếp trong folder DKMH-Extension bạn vừa tải.

*Lưu ý quan trọng: Phải trỏ cài vào folder `extension`, không cài folder `DKMH-Extension` gốc.*

### 3. Vận hành
- Mở Tab cổng thông tin đăng ký Đại Học của trường bạn và ghim biểu tượng GumballZ.
- Nếu hiện thông báo _"Tìm thấy cấu hình Engine EIU..."_, bạn đã có thể cấu hình môn học cần treo máy và bật chạy tự động ngầm!

---

## Sơ đồ cấu trúc lõi

```
DKMH-Extension/
├── extension/                    # Lõi Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── background.js             # Service Worker xử lý Worker Logic Background
│   ├── UIUX/                     # Cấu trúc giao diện popup (CSS Claymorphism)
│   └── prod/
│       ├── engine_controller.js  # Mạch máu trung tâm điều phối Inject
│       └── implementation/       # 👉 [THƯ MỤC CHỨA CÁC ENGINE]
│           ├── eiu_engine.js
│           ├── tdmu_engine.js
│           └── huflit_engine.js
├── web-portal/                   # Giao diện Landing Page (Theme Claymorphism)
│   ├── index.html
│   ├── style.css
│   └── script.js
├── engines-manifest.js           # File Config định tuyến trường & Regex quét thẻ URL
├── README.md                     # Tài liệu tiếng Việt
└── CONTRIBUTING.md               # Tài liệu đóng góp Engine
```

---

## Gửi đóng góp mã nguồn (PR Của Lập Trình Viên)

Bạn muốn viết thêm module vượt bảo mật riêng cho Cổng trực tuyến trường bạn? Xem hướng dẫn tại file [CONTRIBUTING.md](./CONTRIBUTING.md) để biết cách định dạng code và gửi Pull Request (PR) về Repository tổng trị giá nhánh này.

---

## Giấy phép (License)
GumballZ đăng ký theo **MIT License**. Bạn có toàn quyền sao chép, chỉnh sửa hoặc đăng tải lại phục vụ cho môi trường Coder Việt Nam phát triển. Vui lòng ghi nguồn vinh danh Tác giả. (Xem [LICENSE](./LICENSE))

---

*GumballZ Registration Ecosystem - Phát triển bởi Nguyễn Quốc Hưng, EIU Student*
