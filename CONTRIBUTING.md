# Hướng dẫn đóng góp cho GumballZ

Cảm ơn bạn đã quan tâm đến việc đóng góp mã nguồn cho hệ sinh thái **GumballZ**!
Mội bạn sinh viên đều có thể tự tay lập trình module riêng biệt (gọi là **Engine**) để phá khóa và tương tác API đặt môn học trên Cổng đào tạo của trường đại học bạn đang theo học. Bằng cách gộp chung vào 1 nơi, Extension sẽ tự chuyển mình thành phiên bản mạnh mẽ đa trường trực tuyến.

---

## Cách đưa Engine trường bạn vào hệ sinh thái GumballZ

### Bước 1: Fork Repository nhánh gốc

Tiến hành Fork source trên Github, clone về máy và tạo nhánh (branch) mới:

```bash
git clone https://github.com/TÊN-GIẢ-CỦA-BẠN/DKMH-Extension.git
git checkout -b feature/them-truong-uit-engine
```

### Bước 2: Khởi tạo module Engine Javascript

Mọi đoạn Code vượt rào / Crawl data đều xử lý trong thư mục **Implementation**:
- Tạo file mới tại đường dẫn: `extension/prod/implementation/`
- Tên ví dụ: `uit_engine.js` hoặc `ueh_engine.js` (Hãy tham khảo format `eiu_engine.js` cũ).

### Bước 3: Implement Cấu trúc Bắt buộc (The Core Interface)

Thư viện nạp Engine chạy ẩn yêu cầu Export 1 Object Javascript chứa quy chuẩn nhất định. Hãy sao chép Template sau:

```javascript
// extension/prod/implementation/tentruong_engine.js

const TruongTuiEngine = {
  // ===== 1. Khai báo thông tin hiển thị =====
  schoolName: "Đại học Bách Khoa TP.HCM (HCMUT)",
  shortName: "HCMUT",

  // [Quan Trọng] Trình khớp Regex bắt đường link website 
  // của trường đại học sẽ sử dụng hệ thống GumballZ này.
  urlPatterns: ["tuyen-sinh.hcmut.edu.vn", "mybk.hcmut.edu.vn"],

  // ===== 2. Định Nghĩa DOM Selectors =====
  selectors: {
    usernameField: "#tai_khoan_bk", 
    passwordField: "#mat_khau_bk",
    loginButton: ".btn-login-bk",
    courseSearchInput: "#nhap_ma_mon_hp",
    registerButton: "#btn_dk_hoc_phan",
    statusMessage: ".modal-alert-txt",
  },

  // ===== 3. Logic Hoạt động Cơ sở =====

  /**
   * Báo cho Bot biết đây có phải trang Log-In không?
   */
  isLoginPage() {
    return window.location.href.includes("/login");
  },

  /**
   * Bơm Account - Password vô Cổng. (Hãy tạo human-delay để lách firewall tường lửa Cổng web).
   */
  async login(username, password) {
    throw new Error("Người đóng góp chưa lập trình hàm login");
  },

  /**
   * Truyền API Request hoặc dùng Web-Element để nhấn Click đăng ký môn.
   */
  async register(courseCode) {
    throw new Error("Người đóng góp chưa lập trình hàm register");
  },

  /**
   * Đọc Pop-up text để biết đã Đạt thành công - Môn Đầy sĩ số - Hay Trùng thời khoá biểu.
   */
  async checkStatus() {
    throw new Error("Người đóng góp chưa lặp trình vòng lập xác nhận");
  },

  /**
   * Băm nhẹ Request fetch "nhá hàng" để Hệ thống trường không tự thoát khỏi phiên do Afk quá lâu.
   */
  async sendHeartbeat() {
    // Vd: await fetch("api/giu-kone-session");
  },
};

// Module export ra ngoài Engine Controller
if (typeof module !== "undefined") {
  module.exports = TruongTuiEngine;
}
```

### Bước 4: Khai Báo Sinh Nhai Với Trạm Cấu Hình (`engines-manifest.js`)

**ĐÂY LÀ ĐIỂM THAY ĐỔI LỚN NHẤT:** Bạn **không** cần phải chỉnh sửa file `engine_controller.js`. Hãy mở file Nguồn Nền Tảng (Single Source of Truth) tại thư mục Root.

Mở file: `DKMH-Extension/engines-manifest.js`
Thêm đối tượng thiết lập cho trường của bạn vào mảng `GUMBALLZ_ENGINES`:

```javascript
  {
    shortName:  "UIT",
    fullName:   "ĐH Công nghệ Thông tin (UIT - VNU-HCM)",
    file:       "uit_engine.js", // Tên file đã đặt ở bước 2
    status:     "beta",          // hoặc 'active'
    statusLabel:"Beta",
    patterns:   ["suwo.uit.edu.vn", "dangky.uit.edu.vn"]
  },
```

> [!WARNING]
> Vì file này là Nguồn Trị Sự chung cho toàn dự án nên việc copy đè sang giao diện Web-Portal (`web-portal/engines-manifest.js`) là cực kỳ quan trọng để đảm bảo Landing Page biết có Engine trường mới gia nhập hệ sinh thái!

### Bước 5: Pull Request Gộp Giao Diện (Push PR)

Mọi chức năng Push code lên Git của các bạn là sự lan tỏa thành công của hệ sinh thái đăng ký học tập Việt Nam!
Vui lòng soạn Mô tả Pull Request (Description):
- Tên trường mới:
- API Check vượt Cổng WAF / Bot detection / Captcha.
- Demo tính ổn định.

Liên hệ quản trị kho dữ liệu dự án trên [Pull Requests](https://github.com/nughnguyen/DKMH-Extension/pulls) hoặc liên lạc qua email: `hungnq.august.work@gmail.com`.

---

_Cảm ơn bạn! GumballZ Registration System mạnh mẽ hơn là nhờ vào các Coder tâm huyết!_
