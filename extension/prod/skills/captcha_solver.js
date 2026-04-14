/**
 * GumballZ - Captcha Solver (Skill)
 * Ho tro: 2Captcha API, Anti-Captcha API
 * Fallback: Yeu cau nguoi dung giai tay
 * Tac gia: Nguyen Quoc Hung - EIU Student
 */

"use strict";

window.__gumballz_captcha = {

  // ============================================================
  // CAPTCHA DETECTION
  // ============================================================

  /**
   * Kiem tra xem trang co captcha khong
   * @returns {{ found: boolean, type: string|null, element: Element|null }}
   */
  detect() {
    // reCAPTCHA v2
    const recaptchaV2 = document.querySelector(".g-recaptcha, [data-sitekey]");
    if (recaptchaV2) {
      return { found: true, type: "recaptcha_v2", element: recaptchaV2 };
    }

    // hCaptcha
    const hcaptcha = document.querySelector(".h-captcha, [data-hcaptcha-sitekey]");
    if (hcaptcha) {
      return { found: true, type: "hcaptcha", element: hcaptcha };
    }

    // Image CAPTCHA (phong kieu Viet Nam)
    const imgCaptcha =
      document.querySelector('img[src*="captcha"]') ||
      document.querySelector('img[id*="captcha"]') ||
      document.querySelector("#imgCaptcha") ||
      document.querySelector(".captcha-img");
    if (imgCaptcha) {
      return { found: true, type: "image_captcha", element: imgCaptcha };
    }

    return { found: false, type: null, element: null };
  },

  // ============================================================
  // 2CAPTCHA SOLVER
  // ============================================================

  /**
   * Giai CAPTCHA qua 2Captcha API
   * @param {string} apiKey
   * @param {object} captchaInfo - { type, siteKey?, imageBase64? }
   * @returns {Promise<string>} - Chuoi CAPTCHA da giai
   */
  async solveWith2Captcha(apiKey, captchaInfo) {
    const BASE_URL = "https://2captcha.com";

    let taskParams = {};

    if (captchaInfo.type === "recaptcha_v2") {
      taskParams = {
        method:    "userrecaptcha",
        googlekey: captchaInfo.siteKey,
        pageurl:   window.location.href
      };
    } else if (captchaInfo.type === "image_captcha") {
      taskParams = {
        method: "base64",
        body:   captchaInfo.imageBase64
      };
    } else {
      throw new Error(`[GumballZ] Loai CAPTCHA chua ho tro: ${captchaInfo.type}`);
    }

    // Gui yeu cau giai
    const submitResp = await fetch(`${BASE_URL}/in.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ key: apiKey, ...taskParams, json: 1 })
    });
    const submitData = await submitResp.json();

    if (!submitData.status) {
      throw new Error(`[GumballZ] 2Captcha submit loi: ${submitData.error_text}`);
    }

    const captchaId = submitData.request;
    console.log(`[GumballZ] 2Captcha ID: ${captchaId}. Dang cho ket qua...`);

    // Polling ket qua
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 5000)); // Doi 5s moi lan

      const resultResp = await fetch(
        `${BASE_URL}/res.php?key=${apiKey}&action=get&id=${captchaId}&json=1`
      );
      const resultData = await resultResp.json();

      if (resultData.status === 1) {
        console.log("[GumballZ] 2Captcha giai thanh cong!");
        return resultData.request;
      }
      if (resultData.request !== "CAPCHA_NOT_READY") {
        throw new Error(`[GumballZ] 2Captcha loi: ${resultData.request}`);
      }
    }

    throw new Error("[GumballZ] 2Captcha timeout sau 150 giay.");
  },

  // ============================================================
  // IMAGE CAPTCHA EXTRACTOR
  // ============================================================

  /**
   * Lay base64 tu img element
   */
  async extractImageBase64(imgEl) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx    = canvas.getContext("2d");
      const img    = new Image();

      img.crossOrigin = "anonymous";
      img.onload = () => {
        canvas.width  = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png").split(",")[1]);
      };
      img.onerror = reject;
      img.src = imgEl.src + `?_nocache=${Date.now()}`;
    });
  },

  // ============================================================
  // MANUAL FALLBACK
  // ============================================================

  /**
   * Hien thi prompt yeu cau nguoi dung nhap CAPTCHA thu cong
   * @param {Element} captchaImgEl
   * @returns {Promise<string>}
   */
  async askUser(captchaImgEl) {
    return new Promise((resolve) => {
      // Tao overlay
      const overlay = document.createElement("div");
      overlay.id = "__gz_captcha_overlay";
      overlay.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,.65);
        display:flex; align-items:center; justify-content:center;
        z-index:2147483647; font-family:system-ui,sans-serif;
      `;

      const box = document.createElement("div");
      box.style.cssText = `
        background:#fff; border-radius:16px; padding:28px 32px;
        max-width:360px; width:100%; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,.3);
      `;

      const title = document.createElement("h3");
      title.textContent = "GumballZ - Nhap CAPTCHA";
      title.style.cssText = "margin:0 0 16px; font-size:17px; color:#1a1a2e;";

      const imgClone = document.createElement("img");
      imgClone.src = captchaImgEl.src + `?_=${Date.now()}`;
      imgClone.style.cssText = "max-width:100%; border-radius:8px; margin-bottom:16px; border:1px solid #e8e8e8;";

      const input = document.createElement("input");
      input.type        = "text";
      input.placeholder = "Nhap ky tu trong anh...";
      input.style.cssText = `
        width:100%; box-sizing:border-box; padding:10px 14px;
        border:1.5px solid #d1d5db; border-radius:10px; font-size:15px;
        margin-bottom:14px; outline:none;
      `;

      const btn = document.createElement("button");
      btn.textContent = "Xac nhan";
      btn.style.cssText = `
        width:100%; padding:11px; background:#4f46e5; color:#fff;
        border:none; border-radius:10px; font-size:15px; cursor:pointer;
        font-weight:600; transition:background .2s;
      `;
      btn.onmouseover = () => btn.style.background = "#4338ca";
      btn.onmouseout  = () => btn.style.background = "#4f46e5";
      btn.onclick     = () => {
        const val = input.value.trim();
        if (val) {
          document.body.removeChild(overlay);
          resolve(val);
        }
      };

      input.onkeydown = (e) => { if (e.key === "Enter") btn.click(); };

      box.append(title, imgClone, input, btn);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
      input.focus();
    });
  },

  // ============================================================
  // AUTO SOLVE (Main Entry Point)
  // ============================================================

  /**
   * Tu dong giai CAPTCHA: thu 2Captcha truoc, fallback thu cong
   * @param {string?} apiKey2Captcha
   * @returns {Promise<string>}
   */
  async autoSolve(apiKey2Captcha = null) {
    const captchaInfo = this.detect();
    if (!captchaInfo.found) return null;

    console.log(`[GumballZ] Phat hien CAPTCHA loai: ${captchaInfo.type}`);

    // Thu 2Captcha neu co API key
    if (apiKey2Captcha) {
      try {
        let siteKey = null;
        let imageBase64 = null;

        if (captchaInfo.type === "recaptcha_v2") {
          siteKey = captchaInfo.element.dataset.sitekey;
        } else if (captchaInfo.type === "image_captcha") {
          imageBase64 = await this.extractImageBase64(captchaInfo.element);
        }

        const solved = await this.solveWith2Captcha(apiKey2Captcha, {
          type: captchaInfo.type, siteKey, imageBase64
        });

        // Dien vao form
        const captchaInput =
          document.querySelector('input[name*="captcha"]') ||
          document.querySelector("#captchaInput") ||
          document.querySelector(".captcha-input");
        if (captchaInput) captchaInput.value = solved;

        return solved;
      } catch (err) {
        console.warn("[GumballZ] 2Captcha that bai, yeu cau thu cong:", err.message);
      }
    }

    // Fallback: yeu cau nguoi dung
    if (captchaInfo.type === "image_captcha") {
      return await this.askUser(captchaInfo.element);
    }

    console.warn("[GumballZ] Khong the giai CAPTCHA tu dong. Vui long tu nhap.");
    return null;
  }
};
