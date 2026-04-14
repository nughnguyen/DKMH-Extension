# Huong dan dong gop cho GumballZ

Cam on ban da quan tam den viec dong gop cho GumballZ!
Tung sinh vien o moi truong co the giup he thong ho tro them nhieu truong hon.

---

## Cach them Engine cho truong cua ban

### 1. Fork repository

```bash
git fork https://github.com/nughnguyen/DKMH-Extension
git checkout -b feature/ten-truong-engine
```

### 2. Tao file engine moi

Tao file moi trong `extension/prod/implementation/`:

```
ten_truong_engine.js
```

Vi du: `bku_engine.js`, `hust_engine.js`, `vnu_engine.js`

### 3. Implement interface chuan

Moi engine **bat buoc** phai export mot object theo interface sau:

```javascript
// extension/prod/implementation/ten_truong_engine.js

const TenTruongEngine = {
  // ===== THONG TIN TRUONG (BAT BUOC) =====
  schoolName: "Ten day du cua truong",
  shortName: "TEN",

  // URL patterns de nhan dien truong
  // Su dung regex hoac string
  urlPatterns: ["tentruong.edu.vn", "dkmh.tentruong.edu.vn"],

  // ===== SELECTORS (BAT BUOC) =====
  // CSS selectors cho cac phan tu tren trang truong
  selectors: {
    usernameField: "#username", // O nhap ten dang nhap
    passwordField: "#password", // O nhap mat khau
    loginButton: "#btn-login", // Nut dang nhap
    courseSearchInput: "#ma-mon", // O nhap ma mon hoc
    registerButton: ".btn-register", // Nut dang ky
    statusMessage: ".alert", // Khu vuc hien thi ket qua
  },

  // ===== METHODS (BAT BUOC) =====

  /**
   * Kiem tra xem trang hien tai co phai trang login khong
   * @returns {boolean}
   */
  isLoginPage() {
    // Vi du:
    return (
      window.location.href.includes("/login") ||
      !!document.querySelector(this.selectors.usernameField)
    );
  },

  /**
   * Thuc hien tu dong dang nhap
   * @param {string} username - Ten dang nhap
   * @param {string} password - Mat khau
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async login(username, password) {
    // Implement logic dang nhap cua truong o day
    // Su dung humanLikeDelay() de tranh bi WAF phat hien
    throw new Error("Chua implement login()");
  },

  /**
   * Dang ky mot mon hoc
   * @param {string} courseCode - Ma mon hoc
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async register(courseCode) {
    // Implement logic dang ky mon hoc o day
    throw new Error("Chua implement register()");
  },

  /**
   * Kiem tra ket qua dang ky
   * @returns {Promise<{registered: boolean, message: string}>}
   */
  async checkStatus() {
    // Kiem tra trang thai dang ky hien tai
    throw new Error("Chua implement checkStatus()");
  },

  /**
   * Gui heartbeat request de duy tri session
   * @returns {Promise<void>}
   */
  async sendHeartbeat() {
    // Tuy chon: Fetch mot URL no-op de giu session
    // Vi du: await fetch("/api/ping", { credentials: "include" });
  },
};

// QUAN TRONG: Phai export dung ten bien
// engine_controller.js se nap file nay va dung giao dien nay
if (typeof module !== "undefined") {
  module.exports = TenTruongEngine;
}
```

### 4. Dang ky engine vao controller

Mo file `extension/prod/engine_controller.js` va them engine cua ban vao mang `ENGINES`:

```javascript
// Trong engine_controller.js
const ENGINE_REGISTRY = [
  // ... cac engine khac ...
  {
    patterns: ["tentruong.edu.vn"],
    file: "ten_truong_engine.js",
    name: "Ten Truong Dai Hoc",
  },
];
```

### 5. Viet tests (Khuyen khich)

Tao file test trong `extension/prod/implementation/tests/`:

```
ten_truong_engine.test.js
```

### 6. Cap nhat README

Them truong cua ban vao bang "Cac truong duoc ho tro" trong `README.md`.

---

## Quy tac chung

- **Khong luu mat khau** trong source code
- **Su dung `humanLikeDelay()`** cho tat ca cac action tu dong
- **Xu ly loi day du**: network timeout, CAPTCHA, session expired
- **Comment bang tieng Viet** la duoc khuyen khich
- **Mo ta ro rang** trong Pull Request: ten truong, da test o dau, luu y gi

---

## Mau Pull Request

```
## Them engine cho [Ten Truong]

**URL truong**: https://dkmh.tentruong.edu.vn
**Da test voi**: Chrome 120, Windows 11
**Ky thuat dac biet**: [Neu co, vi du: bypass CAPTCHA loai X]

### Checklist
- [ ] Da implement day du 4 methods bat buoc
- [ ] Da test tay ket qua
- [ ] Da cap nhat README
- [ ] Khong co hardcode credentials
```

---

## Lien he ho tro

Gap kho khan? Lien he qua:

- GitHub Issues: [nughnguyen/DKMH-Extension/issues](https://github.com/nughnguyen/DKMH-Extension/issues)
- Email: hungnq.august.work@gmail.com

---

_Cam on vi dong gop de GumballZ ngay cang tot hon!_
