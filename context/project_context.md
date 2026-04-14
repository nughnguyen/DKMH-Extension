# GumballZ Registration Ecosystem - Project Context

## Tong quan du an

**Ten du an**: GumballZ Registration Ecosystem
**Tac gia**: Nguyen Quoc Hung - EIU Student
**GitHub**: https://github.com/nughnguyen/DKMH-Extension
**Khoi tao**: Thang 4/2026
**Phien ban hien tai**: 1.0.0

---

## Van de can giai quyet

Sinh vien Viet Nam hanh toan gap kho khan trong mua dang ky mon hoc:
1. Server truong qua tai, treo, crash
2. Phai canh man hinh luc nua dem cho gio mo dang ky
3. Mat thoi gian nhieu, de sai sot
4. Khong co cong cu ho tro chuyen nghiep

---

## Quyet dinh kien truc

### Tai sao Chrome Extension (khong phai Web App)?
- Truy cap duoc DOM cua trang truong (same-origin bypass)
- Khong can proxy, khong lo CORS
- Co the inject script truc tiep vao session nguoi dung
- De phan phoi qua Chrome Web Store

### Tai sao Manifest V3?
- Chuan moi nhat cua Chrome, ho tro lau dai
- Service Worker thay the Background Page
- Bao mat hon, oc tuong phap hieu qua hon

### Tai sao Plug-and-Play Engine?
- Moi truong co he thong khac nhau (AQTech, Edusofts, custom...)
- De mo rong: sinh vien truong khac co the tu viet engine
- De bao tri: loi o engine EIU khong anh huong TDMU

---

## Lo trinh phat trien

### v1.0.0 (Hien tai)
- [x] Engine co ban cho EIU va TDMU
- [x] Auto-login, Session Keeper
- [x] Giao dien popup Glassmorphism
- [x] Landing Page + Donate section
- [x] Scheduled Start (hen gio)
- [x] Telegram Notify

### v1.1.0 (Ke hoach)
- [ ] TDTU engine
- [ ] CAPTCHA auto-solve tich hop
- [ ] Export lich hoc ra Google Calendar

### v1.2.0 (Ke hoach)
- [ ] Cloud Sync (luu danh sach mon hoc)
- [ ] Crowdsourced Server Status
- [ ] Multi-Tab parallel registration

### v2.0.0 (Tuong lai xa)
- [ ] AI-powered schedule optimizer
- [ ] Cross-browser support (Firefox, Edge)
- [ ] Mobile companion app

---

## Cac truong dang nghien cuu them

| Truong | He thong | Uu tien |
|--------|----------|---------|
| TDTU - Ton Duc Thang | AQTech | Cao |
| UEH - Kinh te TP.HCM | Custom | Cao |
| HCMUT - Bach Khoa | Edusofts | Trung binh |
| UIT - CNTT | Custom | Trung binh |
| HUTECH | AQTech | Thap |

---

## Ghi chu ky thuat

### AQTech System (EIU, TDMU, TDTU)
- URL pattern: thường chứa `/aqtea/` hoặc `/AqMain/`
- Session: Cookie-based, expire sau ~30 phut khong hoat dong
- CAPTCHA: Mot so truong dung image CAPTCHA co do kho trung binh
- Rate limiting: Request qua nhanh se bi block tam thoi 5 phut

### Anti-Ban Strategy
- Human-like delay: Random 800-2500ms giua moi action
- Jitter: ±200ms ngau nhien
- Mouse movement simulation: Khi co the
- Retry backoff: 1s, 2s, 4s, 8s (exponential)

---

*Cap nhat lan cuoi: Thang 4/2026 boi Nguyen Quoc Hung*
