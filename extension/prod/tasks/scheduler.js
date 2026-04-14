/**
 * GumballZ - Scheduler Task
 * Hen gio tu dong bat dau dang ky
 * Tac gia: Nguyen Quoc Hung - EIU Student
 */

"use strict";

window.GumballZScheduler = {
  _countdownTimer: null,

  /**
   * Dat hen gio Scheduled Start
   * @param {string} targetDateTimeISO - ISO format: "2026-04-15T08:00:00"
   * @param {Function} onTick - Callback moi giay: (remainingMs) => void
   * @param {Function} onFire - Callback khi den gio
   */
  async schedule(targetDateTimeISO, onTick, onFire) {
    const target = new Date(targetDateTimeISO).getTime();
    const now    = Date.now();

    if (target <= now) {
      console.warn("[GumballZ] Scheduler: Thoi gian da qua.");
      return { ok: false, error: "Thoi gian da qua" };
    }

    // Luu vao storage
    await new Promise((r) =>
      chrome.storage.local.set({ gumballz_scheduled_time: targetDateTimeISO }, r)
    );

    // Gui alarm cho background service worker (chiu duoc shutdown)
    const bgResult = await chrome.runtime.sendMessage({
      action:  "SCHEDULE_START",
      isoTime: targetDateTimeISO
    });

    // Bat dau countdown hien thi (tab nay mo)
    this._startCountdown(target, onTick, onFire);

    console.log(`[GumballZ] Scheduler: Dat hen gio luc ${targetDateTimeISO}`);
    return { ok: bgResult.ok };
  },

  /**
   * Huy hen gio
   */
  async cancel() {
    this._stopCountdown();
    await chrome.runtime.sendMessage({ action: "CANCEL_SCHEDULE" });
    await new Promise((r) =>
      chrome.storage.local.remove("gumballz_scheduled_time", r)
    );
    console.log("[GumballZ] Scheduler: Da huy hen gio.");
  },

  /**
   * Countdown timer (hien thi thoi gian con lai)
   */
  _startCountdown(targetMs, onTick, onFire) {
    this._stopCountdown();

    this._countdownTimer = setInterval(() => {
      const remaining = targetMs - Date.now();

      if (remaining <= 0) {
        this._stopCountdown();
        if (typeof onFire === "function") onFire();
        return;
      }

      if (typeof onTick === "function") onTick(remaining);
    }, 1000);
  },

  _stopCountdown() {
    if (this._countdownTimer) {
      clearInterval(this._countdownTimer);
      this._countdownTimer = null;
    }
  },

  /**
   * Format milliseconds thanh HH:MM:SS
   */
  formatCountdown(ms) {
    if (ms <= 0) return "00:00:00";
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  },

  /**
   * Lay scheduled time tu storage
   */
  async getScheduledTime() {
    return new Promise((r) =>
      chrome.storage.local.get("gumballz_scheduled_time", (d) =>
        r(d.gumballz_scheduled_time || null)
      )
    );
  }
};
