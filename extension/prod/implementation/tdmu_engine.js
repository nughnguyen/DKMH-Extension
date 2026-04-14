/**
 * GumballZ - TDMU Engine (Dai hoc Thu Dau Mot)
 * He thong Edusofts / AQTech hybrid - Plug-and-Play Implementation
 * Tac gia: Nguyen Quoc Hung - EIU Student
 *
 * Status: BETA - Can them kiem tra thuc te
 * De dong gop: xem CONTRIBUTING.md
 */

"use strict";

const TDMUEngine = {
  // ============================================================
  // METADATA
  // ============================================================
  schoolName: "TDMU - Dai hoc Thu Dau Mot",
  shortName:  "TDMU",
  version:    "0.9.0-beta",

  urlPatterns: [
    "tdmu.edu.vn",
    "qldt.tdmu",
    "dkmh.tdmu",
    "edusofts.tdmu"
  ],

  // ============================================================
  // SELECTORS (phai cap nhat neu truong thay doi giao dien)
  // ============================================================
  selectors: {
    // Login form
    usernameField: "input[name='username'], #username, #txtUser, input[placeholder*='dang nhap']",
    passwordField: "input[type='password'], #txtPassword, input[name='password']",
    captchaInput:  "input[name='captcha'], #txtMaXacNhan",
    captchaImage:  "img[src*='captcha'], img[src*='CaptchaImage']",
    loginButton:   "button[type='submit'], input[type='submit'], #btnLogin, .btn-login",

    // Dashboard / Course Registration
    courseCodeInput: "input[name*='mamonhoc'], input[name*='MaMon'], #txtMon",
    searchButton:    "#btnSearch, button[class*='search'], .btn-tim-kiem",
    registerButton:  "a[class*='dangky'], button[class*='register'], .btn-dang-ky",
    courseTable:     "table[class*='course'], .danh-sach-mon, #tblMon",
    resultMessage:   ".alert, .message, #lblResult, [class*='thong-bao']",
    logoutLink:      "a[href*='logout'], a[href*='DangXuat'], #lnkLogout"
  },

  // ============================================================
  // STATE
  // ============================================================
  _isLoggedIn: false,

  // ============================================================
  // DETECTION
  // ============================================================

  isLoginPage() {
    const url = window.location.href.toLowerCase();
    return !!(
      document.querySelector(this.selectors.usernameField) ||
      url.includes("login") ||
      url.includes("dangnhap") ||
      url.includes("dang-nhap")
    );
  },

  isRegistrationPage() {
    const url = window.location.href.toLowerCase();
    return !!(
      document.querySelector(this.selectors.courseCodeInput) ||
      url.includes("dangkymon") ||
      url.includes("dkmon") ||
      url.includes("registration")
    );
  },

  // ============================================================
  // LOGIN
  // ============================================================

  async login(username, password) {
    console.log("[TDMU Engine] Bat dau dang nhap. Phien ban:", this.version);

    const delay = (n) => new Promise((r) => setTimeout(r, n));

    const userEl   = document.querySelector(this.selectors.usernameField);
    const passEl   = document.querySelector(this.selectors.passwordField);
    const loginBtn = document.querySelector(this.selectors.loginButton);

    if (!userEl || !passEl) {
      return { success: false, message: "Khong tim thay form dang nhap TDMU." };
    }

    // CAPTCHA handling
    const captchaImg = document.querySelector(this.selectors.captchaImage);
    if (captchaImg) {
      console.log("[TDMU Engine] Phat hien CAPTCHA, dang giai...");
      const solved = await window.__gumballz_captcha?.autoSolve(null);
      if (solved) {
        const captchaInput = document.querySelector(this.selectors.captchaInput);
        if (captchaInput) captchaInput.value = solved;
      }
    }

    await this._fillField(userEl, username);
    await delay(350 + Math.random() * 350);
    await this._fillField(passEl, password);
    await delay(600 + Math.random() * 600);

    if (loginBtn) {
      loginBtn.click();
    } else {
      passEl.closest("form")?.submit();
    }

    await delay(2500);

    // Kiem tra ket qua dang nhap
    if (document.querySelector(this.selectors.logoutLink)) {
      this._isLoggedIn = true;
      window.__gumballz_heartbeat_url = window.location.href;
      return { success: true, message: "Dang nhap TDMU thanh cong." };
    }

    // Kiem tra thong bao loi tu trang
    const errEl = document.querySelector(".alert-danger, .error, [class*='error']");
    return {
      success: false,
      message: errEl?.textContent?.trim() || "Dang nhap that bai, kiem tra lai tai khoan."
    };
  },

  // ============================================================
  // REGISTER
  // ============================================================

  async register(courseCode) {
    const delay = (n) => new Promise((r) => setTimeout(r, n));

    // Phuong phap 1: Dang ky qua giao dien
    const codeInput  = document.querySelector(this.selectors.courseCodeInput);
    const searchBtn  = document.querySelector(this.selectors.searchButton);

    if (codeInput && searchBtn) {
      await this._fillField(codeInput, courseCode);
      await delay(300);
      searchBtn.click();
      await delay(1500 + Math.random() * 1000);

      const regBtn = document.querySelector(this.selectors.registerButton);
      if (regBtn) {
        regBtn.click();
        await delay(1000);
        return await this.checkStatus(courseCode);
      }

      return { success: false, message: `Mon hoc ${courseCode} khong tim thay hoac het cho.` };
    }

    // Phuong phap 2: Dang ky qua AJAX endpoint
    return await this._registerViaAjax(courseCode);
  },

  async _registerViaAjax(courseCode) {
    const origin = window.location.origin;
    const endpoints = [
      `${origin}/api/registration/register`,
      `${origin}/DangKyMon/DangKy`,
      `${origin}/Student/RegistCourse`,
      `${origin}/qldt/dangky`
    ];

    for (const url of endpoints) {
      try {
        const resp = await fetch(url, {
          method:      "POST",
          credentials: "include",
          headers: {
            "Content-Type":     "application/json",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: JSON.stringify({ maMonHoc: courseCode, MaMHK: courseCode })
        });

        if (resp.ok) {
          let data;
          try { data = await resp.json(); } catch { data = { message: await resp.text() }; }

          const success = data?.success || data?.status === 1 ||
                         data?.message?.toLowerCase().includes("thanh cong");

          return {
            success,
            message: data?.message || (success ? "Dang ky thanh cong" : "That bai"),
            rateLimited: resp.status === 429
          };
        }

        if (resp.status === 429) {
          return { success: false, message: "Server dang qua tai. Thu lai sau.", rateLimited: true };
        }
      } catch (err) {
        console.warn(`[TDMU Engine] Endpoint ${url} that bai:`, err.message);
      }
    }

    return { success: false, message: "Tat ca endpoint dang ky deu that bai." };
  },

  // ============================================================
  // CHECK STATUS
  // ============================================================

  async checkStatus(courseCode) {
    const msgEl = document.querySelector(this.selectors.resultMessage);
    const msg = msgEl?.textContent?.trim() || "";

    const isSuccess = msg.includes("thanh cong") ||
                      msg.toLowerCase().includes("success") ||
                      msg.includes("da dang ky");

    return {
      success:    isSuccess,
      registered: isSuccess,
      message:    msg || "Khong co thong bao ro rang."
    };
  },

  // ============================================================
  // HEARTBEAT
  // ============================================================

  async sendHeartbeat() {
    try {
      await fetch(window.location.href, { credentials: "include", cache: "no-cache" });
    } catch {}
  },

  // ============================================================
  // HELPER
  // ============================================================
  async _fillField(el, value) {
    el.focus();
    el.value = "";
    for (const char of value) {
      el.value += char;
      el.dispatchEvent(new Event("input",  { bubbles: true }));
      await new Promise((r) => setTimeout(r, 45 + Math.random() * 70));
    }
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur",   { bubbles: true }));
  }
};

// Dang ky vao global
window.__gumballz_engine = TDMUEngine;

// Lang nghe su kien autostart
window.addEventListener("gumballz:autostart", () => {
  chrome.storage.local.get("gumballz_credentials", async ({ gumballz_credentials: creds }) => {
    if (creds?.username && creds?.password && TDMUEngine.isLoginPage()) {
      await TDMUEngine.login(creds.username, creds.password);
    }
  });
});

console.log("[GumballZ] TDMU Engine da san sang. Phien ban:", TDMUEngine.version, "(BETA)");
