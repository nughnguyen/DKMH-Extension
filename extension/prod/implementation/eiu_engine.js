/**
 * GumballZ - EIU Engine (East International University)
 * He thong AQTech - Plug-and-Play Implementation
 * Tac gia: Nguyen Quoc Hung - EIU Student
 *
 * De them truong moi, xem CONTRIBUTING.md
 */

"use strict";

const EIUEngine = {
  // ============================================================
  // METADATA
  // ============================================================
  schoolName: "EIU - Dai hoc Quoc te Eastern",
  shortName: "EIU",
  version: "1.0.0",

  urlPatterns: [
    "eiu.edu.vn",
    "aqtea-eiu",
    "dkmh.eiu",
    "aao.eiu.edu.vn"
  ],

  // Heartbeat URL - giu session song
  heartbeatUrl: null, // Se tu detect sau khi login

  // ============================================================
  // SELECTORS (cap nhat neu truong thay doi giao dien)
  // ============================================================
  selectors: {
    // Login form
    usernameField: "#txtTaiKhoan, input[name='txtTaiKhoan'], #username",
    passwordField: "#txtMatKhau, input[name='txtMatKhau'], input[type='password']",
    captchaInput: "#txtCaptcha, input[name='txtCaptcha']",
    captchaImage: "#imgCaptcha, img[id*='Captcha']",
    loginButton: "#btnDangNhap, input[value*='ng nh'], button[id*='Nhap']",

    // Dashboard / Course Registration
    courseCodeInput: "#txtMaMonHoc, input[name*='MaMonHoc'], #txtMaMon",
    searchButton: "#btnTimKiem, button[id*='Tim']",
    registerButton: ".btnDangKy, button[class*='DangKy'], a[id*='DangKy']",
    courseTable: "#grdDanhSachMon, table[id*='Mon']",
    resultMessage: "#lblThongBao, .thong-bao, [id*='ThongBao']",

    // Status indicators
    logoutLink: "a[href*='DangXuat'], a[id*='Logout']"
  },

  // ============================================================
  // STATE
  // ============================================================
  _isLoggedIn: false,
  _sessionUrl: null,
  _task: null,

  // ============================================================
  // DETECTION
  // ============================================================

  isLoginPage() {
    return !!(
      document.querySelector(this.selectors.usernameField) ||
      document.querySelector(this.selectors.passwordField) ||
      window.location.href.toLowerCase().includes("dangnhap") ||
      window.location.href.toLowerCase().includes("login")
    );
  },

  isRegistrationPage() {
    return !!(
      document.querySelector(this.selectors.courseCodeInput) ||
      window.location.href.toLowerCase().includes("dangkymon") ||
      window.location.href.toLowerCase().includes("dkmh")
    );
  },

  // ============================================================
  // LOGIN
  // ============================================================

  async login(username, password) {
    console.log("[EIU Engine] Bat dau quy trinh dang nhap...");

    const delay = (n) => new Promise((r) => setTimeout(r, n));

    // Tim cac element
    const userEl = document.querySelector(this.selectors.usernameField);
    const passEl = document.querySelector(this.selectors.passwordField);
    const loginBtn = document.querySelector(this.selectors.loginButton);

    if (!userEl || !passEl) {
      return { success: false, message: "Khong tim thay form dang nhap tren trang nay." };
    }

    // Xu ly CAPTCHA truoc (neu co)
    const captchaImg = document.querySelector(this.selectors.captchaImage);
    if (captchaImg) {
      const solved = await window.__gumballz_captcha?.autoSolve(null);
      if (solved) {
        const captchaInput = document.querySelector(this.selectors.captchaInput);
        if (captchaInput) captchaInput.value = solved;
        await delay(300);
      }
    }

    // Nhap thong tin
    await this._fillField(userEl, username);
    await delay(400 + Math.random() * 400);
    await this._fillField(passEl, password);
    await delay(500 + Math.random() * 600);

    // Click dang nhap
    if (loginBtn) {
      loginBtn.click();
    } else {
      const form = passEl.closest("form");
      if (form) form.submit();
    }

    // Doi trang chuyen huong
    await delay(2000);

    // Kiem tra ket qua
    if (document.querySelector(this.selectors.logoutLink)) {
      this._isLoggedIn = true;
      this._sessionUrl = window.location.href;
      window.__gumballz_heartbeat_url = this._sessionUrl;
      console.log("[EIU Engine] Dang nhap thanh cong!");
      return { success: true, message: "Da dang nhap vao he thong EIU." };
    }

    // Kiem tra thong bao loi
    const errEl = document.querySelector(".error-message, .alert-danger, [id*='Error']");
    const errMsg = errEl?.textContent?.trim() || "Dang nhap that bai, vui long kiem tra lai.";
    console.warn("[EIU Engine] Dang nhap that bai:", errMsg);
    return { success: false, message: errMsg };
  },

  // ============================================================
  // REGISTER
  // ============================================================

  async register(courseCode) {
    if (!this.isRegistrationPage()) {
      return { success: false, message: "Khong phai trang dang ky mon hoc." };
    }

    const delay = (n) => new Promise((r) => setTimeout(r, n));

    // Nhap ma mon hoc
    const codeInput = document.querySelector(this.selectors.courseCodeInput);
    if (!codeInput) {
      // Thu dang ky truc tiep qua URL/Form
      return await this._registerViaFetch(courseCode);
    }

    await this._fillField(codeInput, courseCode);
    await delay(300 + Math.random() * 300);

    // Click tim kiem
    const searchBtn = document.querySelector(this.selectors.searchButton);
    if (searchBtn) {
      searchBtn.click();
      await delay(1500 + Math.random() * 1000);
    }

    // Tim nut dang ky trong bang ket qua
    const registerBtn = document.querySelector(this.selectors.registerButton);
    if (!registerBtn) {
      return { success: false, message: `Khong tim thay mon ${courseCode} hoac het cho.` };
    }

    // Click dang ky
    registerBtn.click();
    await delay(1000 + Math.random() * 1000);

    // Doc thong bao ket qua
    return await this.checkStatus(courseCode);
  },

  /**
   * Fallback: Dang ky qua fetch API
   */
  async _registerViaFetch(courseCode) {
    const baseUrl = window.location.origin;

    // Thu cac endpoint phong AQTech pho bien
    const endpoints = [
      `${baseUrl}/AqMain/DangKyMonHoc/DangKy`,
      `${baseUrl}/aqtea/DangKyMonHoc/DangKy`,
      `${baseUrl}/Default.aspx/DangKyMon`
    ];

    for (const endpoint of endpoints) {
      try {
        const resp = await fetch(endpoint, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: new URLSearchParams({ maMonHoc: courseCode, MaMonHoc: courseCode })
        });

        if (resp.ok) {
          const text = await resp.text();
          const success = text.toLowerCase().includes("thanh cong") ||
            text.toLowerCase().includes("success") ||
            text.includes("1");
          return {
            success,
            message: success ? "Dang ky thanh cong qua API!" : `API response: ${text.slice(0, 100)}`
          };
        }
      } catch { }
    }

    return { success: false, message: "Khong the ket noi den server dang ky." };
  },

  // ============================================================
  // CHECK STATUS
  // ============================================================

  async checkStatus(courseCode) {
    const msgEl = document.querySelector(this.selectors.resultMessage);
    if (!msgEl) {
      return { registered: false, message: "Khong doc duoc ket qua tu trang." };
    }

    const msg = msgEl.textContent?.trim() || "";
    const isSuccess = msg.includes("thanh cong") ||
      msg.includes("da dang ky") ||
      msg.toLowerCase().includes("success");

    return {
      success: isSuccess,
      registered: isSuccess,
      message: msg || (isSuccess ? "Dang ky thanh cong" : "Dang ky that bai")
    };
  },

  // ============================================================
  // HEARTBEAT
  // ============================================================

  async sendHeartbeat() {
    const url = this._sessionUrl || window.location.href;
    try {
      await fetch(url, { credentials: "include", cache: "no-cache" });
    } catch { }
  },

  // ============================================================
  // HELPER: Fill field
  // ============================================================
  async _fillField(el, value) {
    el.focus();
    el.value = "";

    for (const char of value) {
      el.value += char;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("keyup", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 50 + Math.random() * 80));
    }

    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
  }
};

// Dang ky vao global de engine_controller co the su dung
window.__gumballz_engine = EIUEngine;

// Lang nghe su kien autostart tu background
window.addEventListener("gumballz:autostart", () => {
  console.log("[EIU Engine] Nhan su kien autostart tu Scheduler.");
  chrome.storage.local.get(["gumballz_credentials", "gumballz_settings"], async (data) => {
    const { gumballz_credentials: creds, gumballz_settings: settings } = data;
    if (creds?.username && creds?.password) {
      if (EIUEngine.isLoginPage()) {
        await EIUEngine.login(creds.username, creds.password);
      }
    }
  });
});

console.log("[GumballZ] EIU Engine da san sang. Phien ban:", EIUEngine.version);
