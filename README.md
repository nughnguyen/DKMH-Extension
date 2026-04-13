# GumballZ Registration Ecosystem

![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Status](https://img.shields.io/badge/Status-Active-success)

Phát triển bởi: **Nguyễn Quốc Hưng - EIU Student**

## Giới thiệu

GumballZ Registration Ecosystem là một công cụ toàn diện hỗ trợ sinh viên các trường đại học (như EIU, TDMU...) trong việc đăng ký môn học một cách nhanh chóng và tự động. Hệ thống báo gồm một Chrome Extension hoạt động như một Engine thông minh tự động nhận diện hệ thống trường, và một Landing Page tích hợp.

_Disclaimer: Công cụ hỗ trợ học tập, không chịu trách nhiệm về sai sót dữ liệu của hệ thống nhà trường._

## Cấu trúc Hệ thống

Hệ thống được thiết kế theo dạng Plug-and-Play (Scalable Architecture):

- **Extension Core**:
  - `prod/implementation/`: Nơi chứa Engine riêng biệt cho từng trường (VD: `eiu_engine.js`, `tdmu_engine.js`).
  - `prod/tasks/`: Chứa các module chức năng (Đăng ký, Polling, Retry, Auto-login).
  - `prod/skills/`: Xử lý ngoại vi (Giải Captcha, Session Keeper).
  - `UIUX/`: Giao diện tương tác người dùng (Glassmorphism, Animations).
- **Web Portal**: Landing Page giới thiệu, hướng dẫn sử dụng và hỗ trợ dự án.

## Tính năng Nổi bật

- **Auto-Login & Session Keeper**: Duy trì trạng thái sống rải rác (heartbeat) để tránh bị Logout khi treo máy.
- **Universal Input**: Tự động nhận diện trường học khi dán URL và áp dụng script tương ứng.
- **Stealth & Anti-Ban**: Mô phỏng hành vi của người thật (Human-like delays) nhằm vượt qua các hệ thống tường lửa (WAF).
- **Cloud Sync & Smart Schedule Preview**: Đồng bộ dữ liệu, lịch học đa nền tảng (sắp ra mắt).

## Hướng dẫn cài đặt

1. Clone Repository này về máy.
2. Mở Chrome, truy cập: `chrome://extensions/`.
3. Bật **Developer mode**.
4. Chọn **Load unpacked** và trỏ đến thư mục `/extension`.

## Đóng góp

Vui lòng tham khảo file `CONTRIBUTING.md` để biết cách viết thêm Engine cho trường của bạn và gửi Pull Request.
