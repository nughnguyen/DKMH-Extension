/**
 * GumballZ - Auto Login Task
 * Tu dong dien form va click dang nhap khi phat hien trang login
 * Tac gia: Nguyen Quoc Hung - EIU Student
 */

"use strict";

(function AutoLogin() {
  // ============================================================
  // HELPERS
  // ============================================================

  /**
   * Delay ngau nhien mang tinh "con nguoi" de tranh WAF
   * @param {number} min - ms toi thieu
   * @param {number} max - ms toi da
   */
  function humanLikeDelay(min = 800, max = 2500) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Lay settings tu storage
   */
  async function getSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["gumballz_settings", "gumballz_credentials"], (data) => {
        resolve({
          settings:    data.gumballz_settings || {},
          credentials: data.gumballz_credentials || {}
        });
      });
    });
  }

  /**
   * Simulate typing tu tu nhu nguoi that
   * @param {HTMLElement} el
   * @param {string} text
   */
  async function simulateTyping(el, text) {
    el.focus();
    el.value = "";
    el.dispatchEvent(new Event("focus", { bubbles: true }));
    
    for (const char of text) {
      el.value += char;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new KeyboardEvent("keypress", { bubbles: true }));
      await humanLikeDelay(50, 150);
    }
    
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  /**
   * Simulate mouse click
   * @param {HTMLElement} el
   */
  function simulateClick(el) {
    el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("mouseup",   { bubbles: true }));
    el.dispatchEvent(new MouseEvent("click",     { bubbles: true }));
    el.click();
  }

  // ============================================================
  // AUTO LOGIN CORE
  // ============================================================

  /**
   * Kiem tra xem trang hien tai co la trang login khong
   */
  function isLoginPage() {
    const indicators = [
      'input[type="password"]',
      'input[name="password"]',
      'input[name="matkhau"]',
      'input[name="pass"]',
      'form[action*="login"]',
      'form[action*="dang-nhap"]',
      "#loginForm",
      ".login-form",
      "[class*='login']"
    ];
    return indicators.some((sel) => document.querySelector(sel) !== null);
  }

  /**
   * Tim o nhap username
   */
  function findUsernameField() {
    const selectors = [
      'input[name="username"]',
      'input[name="user"]',
      'input[name="taikhoan"]',
      'input[name="mssv"]',
      'input[name="email"]',
      'input[type="text"]:first-of-type',
      'input[placeholder*="tai khoan"]',
      'input[placeholder*="username"]',
      'input[placeholder*="ma sinh vien"]',
      "#username",
      "#user",
      "#taikhoan"
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  /**
   * Tim o nhap password
   */
  function findPasswordField() {
    return (
      document.querySelector('input[type="password"]') ||
      document.querySelector('input[name="password"]') ||
      document.querySelector('input[name="matkhau"]')
    );
  }

  /**
   * Tim nut dang nhap
   */
  function findLoginButton() {
    const selectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      "#btnLogin",
      "#btn-login",
      ".btn-login",
      "[class*='login'] button",
      'button[class*="login"]',
      'button:contains("Dang nhap")',
      'button:contains("Login")'
    ];
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch {}
    }
    // Fallback: tim nut submit trong form
    const form = document.querySelector("form");
    if (form) {
      return (
        form.querySelector('button[type="submit"]') ||
        form.querySelector('input[type="submit"]') ||
        form.querySelector("button")
      );
    }
    return null;
  }

  /**
   * Thuc hien auto login
   */
  async function performLogin() {
    const { settings, credentials } = await getSettings();
    
    if (!credentials.username || !credentials.password) {
      console.log("[GumballZ] Chua cau hinh tai khoan. Bo qua auto-login.");
      return;
    }

    // Kiem tra xem co phan engine custom khong
    if (window.__gumballz_engine?.isLoginPage && !window.__gumballz_engine.isLoginPage()) {
      return;
    }
    if (!isLoginPage()) return;

    console.log("[GumballZ] Phat hien trang dang nhap. Dang thuc hien auto-login...");

    // Cho trang load hoan toan
    await humanLikeDelay(1000, 2000);

    const usernameField = findUsernameField();
    const passwordField = findPasswordField();
    const loginButton   = findLoginButton();

    if (!usernameField || !passwordField) {
      console.warn("[GumballZ] Khong tim thay o nhap tai khoan/mat khau.");
      return;
    }

    // Neu co engine custom, uu tien dung no
    if (window.__gumballz_engine?.login) {
      try {
        const result = await window.__gumballz_engine.login(
          credentials.username,
          credentials.password
        );
        console.log("[GumballZ] Engine custom login:", result);
        return;
      } catch (e) {
        console.warn("[GumballZ] Engine custom login that bai, thu fallback:", e.message);
      }
    }

    // Fallback: generic login
    try {
      await simulateTyping(usernameField, credentials.username);
      await humanLikeDelay(400, 800);
      await simulateTyping(passwordField, credentials.password);
      await humanLikeDelay(500, 1200);

      if (loginButton) {
        simulateClick(loginButton);
        console.log("[GumballZ] Da click nut dang nhap.");
      } else {
        // Submit form truc tiep
        const form = passwordField.closest("form");
        if (form) form.submit();
      }

      // Bat dau session keeper
      chrome.runtime.sendMessage({ action: "START_HEARTBEAT" }).catch(() => {});
      chrome.runtime.sendMessage({ action: "START_SESSION_KEEPER" }).catch(() => {});

    } catch (err) {
      console.error("[GumballZ] Auto-login that bai:", err);
    }
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    // Cho engine load truoc
    setTimeout(async () => {
      const { credentials } = await getSettings();
      // Chi chay neu URL trong credentials khop hoac chua co URL (generic)
      const currentHost = window.location.hostname;
      const savedHost   = credentials.url ? (() => {
        try { return new URL(credentials.url).hostname; } catch { return ""; }
      })() : "";

      if (!savedHost || currentHost.includes(savedHost) || savedHost.includes(currentHost)) {
        performLogin();
      }
    }, 1500);
  }

  // Expose API
  window.__gumballz_auto_login = { performLogin, findUsernameField, findPasswordField };

  init();
})();
