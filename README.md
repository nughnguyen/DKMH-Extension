# GumballZ Registration Ecosystem

![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![Manifest](https://img.shields.io/badge/Manifest-V3-orange?style=flat-square)

> **Cong cu ho tro dang ky mon hoc tu dong cho sinh vien Viet Nam.**
> Khong chiu trach nhiem ve sai sot du lieu cua he thong nha truong.

**Phat trien boi: Nguyen Quoc Hung - EIU Student**

---

## Tinh nang noi bat

- **Plug-and-Play Engine**: Moi truong dai hoc la mot module rieng biet, de dang mo rong
- **Auto-Login & Session Keeper**: Tu dong dang nhap va duy tri phien lam viec
- **Stealth Mode**: Mo phong hanh vi nguoi dung de tranh bi WAF phat hien
- **Scheduled Start**: Hen gio tu dong bat dau dang ky
- **Telegram Notify**: Thong bao ket qua tuc thi qua Telegram
- **Multi-Engine**: Ho tro EIU, TDMU va nhieu truong khac (coming soon)

---

## Cac truong duoc ho tro

| Truong | Engine | Trang thai |
|--------|--------|-----------|
| EIU - East International University | `eiu_engine.js` | Active |
| TDMU - Thu Dau Mot University | `tdmu_engine.js` | Beta |
| TDTU - Ton Duc Thang University | Dang nghien cuu | Coming Soon |

---

## Cai dat

### Yeu cau
- Google Chrome phien ban 88 tro len
- (Ty chon) Telegram Bot Token de nhan thong bao

### Huong dan cai dat Extension

1. **Tai source code**:
   ```bash
   git clone https://github.com/nughnguyen/DKMH-Extension.git
   cd DKMH-Extension
   ```

2. **Mo Chrome Extension Manager**:
   - Truy cap `chrome://extensions/`
   - Bat **Developer mode** (goc tren ben phai)

3. **Load extension**:
   - Nhan **Load unpacked**
   - Chon folder `extension/` trong du an

4. **Cau hinh**:
   - Nhan bieu tuong GumballZ tren toolbar
   - Nhap URL truong, tai khoan, mat khau
   - Nhap ma mon hoc can dang ky
   - Nhan **Bat dau**

---

## Cau truc du an

```
DKMH-Extension/
├── extension/                    # Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── background.js             # Service Worker
│   ├── prod/
│   │   ├── engine_controller.js  # Bo dieu phoi engine
│   │   ├── implementation/       # Engine cho tung truong
│   │   │   ├── eiu_engine.js
│   │   │   └── tdmu_engine.js
│   │   ├── tasks/                # Logic nghiep vu
│   │   │   ├── registration_task.js
│   │   │   ├── auto_login.js
│   │   │   └── scheduler.js
│   │   └── skills/               # Ky nang mo rong
│   │       ├── captcha_solver.js
│   │       ├── telegram_notify.js
│   │       └── session_keeper.js
│   └── UIUX/                     # Giao dien Popup
│       ├── popup.html
│       ├── popup.css
│       └── popup.js
├── web-portal/                   # Landing Page
│   ├── index.html
│   ├── style.css
│   └── script.js
├── context/
│   └── project_context.md
├── README.md
└── CONTRIBUTING.md
```

---

## De ve dong gop (Sinh vien truong khac)

Xem [CONTRIBUTING.md](./CONTRIBUTING.md) de biet cach viet engine cho truong cua ban va gui Pull Request.

---

## License

MIT License - Xem [LICENSE](./LICENSE) de biet them chi tiet.

---

*GumballZ Registration Ecosystem - Phat trien boi Nguyen Quoc Hung, EIU Student*
