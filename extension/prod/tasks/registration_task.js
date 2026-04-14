/**
 * GumballZ - Registration Task (Core Logic)
 * Vong lap dang ky mon hoc: polling, retry, anti-ban delays
 * Tac gia: Nguyen Quoc Hung - EIU Student
 */

"use strict";

// ============================================================
// SHARED UTILITIES (inject vao window)
// ============================================================
window.GumballZUtils = window.GumballZUtils || {

  /**
   * Delay co tinh "con nguoi" (random, anti-WAF)
   */
  humanLikeDelay(min = 800, max = 2500) {
    const base  = Math.floor(Math.random() * (max - min + 1)) + min;
    const jitter = Math.floor(Math.random() * 200) - 100; // +-100ms
    return new Promise((r) => setTimeout(r, Math.max(100, base + jitter)));
  },

  /**
   * Exponential backoff delay
   * @param {number} attempt - so lan thu (bat dau tu 0)
   */
  backoffDelay(attempt) {
    const base = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s, 8s, 16s ...
    const cap  = 30000; // Toi da 30 giay
    return new Promise((r) => setTimeout(r, Math.min(base, cap)));
  },

  /**
   * Gui thong bao (Chrome Notification + Telegram)
   */
  async notify(title, body, type = "info") {
    // Chrome notification
    try {
      chrome.runtime.sendMessage({ action: "SHOW_NOTIFICATION", title, body });
    } catch {}

    // Telegram
    const { gumballz_settings } = await new Promise((r) =>
      chrome.storage.local.get("gumballz_settings", r)
    );
    if (gumballz_settings?.telegramBotToken && gumballz_settings?.telegramChatId) {
      window.__gumballz_telegram?.send(`[${type.toUpperCase()}] ${title}\n${body}`).catch(() => {});
    }
  }
};

// ============================================================
// REGISTRATION TASK CLASS
// ============================================================
class RegistrationTask {
  constructor(engine, courseCode, options = {}) {
    this.engine     = engine;
    this.courseCode = courseCode;
    this.options = {
      maxRetries: options.maxRetries || 10,
      pollInterval: options.pollInterval || 3000,
      minDelay: options.minDelay || 800,
      maxDelay: options.maxDelay || 2500,
      ...options
    };

    this.attempt    = 0;
    this.isRunning  = false;
    this.isStopped  = false;

    // Web Worker cho parallel registration
    this._workers = [];
  }

  /**
   * Bat dau dang ky
   */
  async start() {
    if (this.isRunning) {
      console.warn("[GumballZ] Task dang chay, khong the bat dau them.");
      return;
    }
    this.isRunning = true;
    this.isStopped = false;
    this.attempt   = 0;

    // Cap nhat trang thai
    chrome.runtime.sendMessage({ action: "UPDATE_STATUS", status: "running" }).catch(() => {});
    chrome.runtime.sendMessage({ action: "START_HEARTBEAT" }).catch(() => {});

    this._dispatchEvent("start", { courseCode: this.courseCode });
    console.log(`[GumballZ] Bat dau dang ky mon: ${this.courseCode}`);

    await this._registerLoop();
  }

  /**
   * Dung dang ky
   */
  stop() {
    this.isStopped = true;
    this.isRunning = false;
    this._stopWorkers();
    chrome.runtime.sendMessage({ action: "UPDATE_STATUS", status: "idle" }).catch(() => {});
    chrome.runtime.sendMessage({ action: "STOP_HEARTBEAT" }).catch(() => {});
    this._dispatchEvent("stop", {});
    console.log("[GumballZ] Da dung dang ky.");
  }

  // ============================================================
  // PRIVATE: Registration Loop
  // ============================================================
  async _registerLoop() {
    while (!this.isStopped && this.attempt < this.options.maxRetries) {
      this.attempt++;
      this._dispatchEvent("attempt", { attempt: this.attempt, max: this.options.maxRetries });
      console.log(`[GumballZ] Lan thu ${this.attempt}/${this.options.maxRetries}...`);

      try {
        // Delay truoc khi thu (anti-ban)
        if (this.attempt > 1) {
          const delay = await GumballZUtils.humanLikeDelay(
            this.options.minDelay,
            this.options.maxDelay
          );
        }

        const result = await this.engine.register(this.courseCode);

        if (result.success) {
          // Thanh cong!
          await this._onSuccess(result);
          return;
        } else {
          console.log(`[GumballZ] That bai lan ${this.attempt}: ${result.message}`);
          this._dispatchEvent("retry", { attempt: this.attempt, message: result.message });

          // Neu bi rate-limit, backoff lau hon
          if (result.rateLimited) {
            await GumballZUtils.backoffDelay(this.attempt);
          } else {
            await GumballZUtils.humanLikeDelay(this.options.pollInterval, this.options.pollInterval * 1.5);
          }
        }

      } catch (err) {
        console.error(`[GumballZ] Loi khong mong muon lan ${this.attempt}:`, err);
        this._dispatchEvent("error", { attempt: this.attempt, error: err.message });

        // Backoff khi gap loi network
        await GumballZUtils.backoffDelay(Math.min(this.attempt, 5));
      }
    }

    // Het so lan thu
    if (!this.isStopped) {
      await this._onMaxRetries();
    }
  }

  async _onSuccess(result) {
    this.isRunning = false;
    console.log("[GumballZ] Dang ky thanh cong!", result);
    
    await GumballZUtils.notify(
      "Dang ky thanh cong",
      `Mon hoc ${this.courseCode} da duoc dang ky thanh cong!`,
      "success"
    );
    
    chrome.runtime.sendMessage({ action: "UPDATE_STATUS", status: "success" }).catch(() => {});
    chrome.runtime.sendMessage({ action: "STOP_HEARTBEAT" }).catch(() => {});
    
    this._dispatchEvent("success", { courseCode: this.courseCode, message: result.message });
  }

  async _onMaxRetries() {
    this.isRunning = false;
    console.warn(`[GumballZ] Da het ${this.options.maxRetries} lan thu. That bai.`);
    
    await GumballZUtils.notify(
      "Dang ky that bai",
      `Mon ${this.courseCode}: Het so lan thu (${this.options.maxRetries}). Co the server dang qua tai.`,
      "error"
    );
    
    chrome.runtime.sendMessage({ action: "UPDATE_STATUS", status: "failed" }).catch(() => {});
    this._dispatchEvent("failed", { courseCode: this.courseCode, attempts: this.attempt });
  }

  // ============================================================
  // WEB WORKER: Parallel Registration
  // ============================================================

  /**
   * Khoi dong parallel workers tren nhieu endpoint
   * @param {string[]} endpoints - Danh sach URL endpoint phu
   */
  async startParallel(endpoints = []) {
    if (!endpoints.length) {
      return this.start();
    }

    const workerCode = `
      self.onmessage = async function(e) {
        const { endpoint, courseCode, attempt } = e.data;
        try {
          const resp = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ maMonHoc: courseCode })
          });
          const text = await resp.text();
          self.postMessage({ success: resp.ok, status: resp.status, body: text.slice(0, 200) });
        } catch(err) {
          self.postMessage({ success: false, error: err.message });
        }
      };
    `;

    const blob      = new Blob([workerCode], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);

    // Tao worker cho moi endpoint
    const promises = endpoints.map((ep) => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(workerUrl);
        this._workers.push(worker);

        worker.postMessage({ endpoint: ep, courseCode: this.courseCode, attempt: 1 });
        worker.onmessage  = (e) => resolve({ endpoint: ep, ...e.data });
        worker.onerror    = (e) => reject(new Error(e.message));
      });
    });

    try {
      // Race: lay ket qua tu bat ky worker nao thanh cong truoc
      const result = await Promise.race(promises);
      if (result.success) {
        await this._onSuccess({ success: true, message: `Thanh cong qua endpoint: ${result.endpoint}` });
      }
    } catch (err) {
      console.error("[GumballZ] Parallel registration that bai:", err);
      await this._onMaxRetries();
    } finally {
      URL.revokeObjectURL(workerUrl);
      this._stopWorkers();
    }
  }

  _stopWorkers() {
    this._workers.forEach((w) => w.terminate());
    this._workers = [];
  }

  // ============================================================
  // EVENT EMITTER (dung window events de giao tiep voi UI)
  // ============================================================
  _dispatchEvent(type, detail) {
    window.dispatchEvent(new CustomEvent(`gumballz:${type}`, { detail }));
  }
}

// Expose ra window de engine va popup su dung
window.RegistrationTask = RegistrationTask;
