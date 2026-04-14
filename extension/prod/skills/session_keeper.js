/**
 * GumballZ - Session Keeper (Skill)
 * Giu phien dang nhap khong bi het han do khong hoat dong
 * Tac gia: Nguyen Quoc Hung - EIU Student
 */

"use strict";

(function SessionKeeper() {
  // Khoang thoi gian gui heartbeat (ms)
  const HEARTBEAT_INTERVAL_MS = 4 * 60 * 1000; // 4 phut
  
  let heartbeatTimer = null;
  let isActive = false;

  /**
   * Dong bo trang thai voi storage
   */
  async function syncStatus() {
    return new Promise((resolve) => {
      chrome.storage.local.get("gumballz_status", (data) => {
        resolve(data.gumballz_status || "idle");
      });
    });
  }

  /**
   * Gui heartbeat request de duy tri session
   * Cac engine co the override window.__gumballz_heartbeat_url
   */
  async function sendHeartbeat() {
    const status = await syncStatus();
    if (status !== "running") return;

    // Lay heartbeat URL tu engine (neu co) hoac dung URL hien tai
    const heartbeatUrl = window.__gumballz_heartbeat_url || window.location.href;

    try {
      const response = await fetch(heartbeatUrl, {
        method:      "GET",
        credentials: "include",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Cache-Control":    "no-cache"
        }
      });
      
      if (response.ok) {
        console.log("[GumballZ] Heartbeat OK:", response.status);
      } else {
        console.warn("[GumballZ] Heartbeat response:", response.status);
      }
    } catch (err) {
      console.warn("[GumballZ] Heartbeat that bai:", err.message);
    }
  }

  /**
   * Bat dau Session Keeper
   */
  function start() {
    if (isActive) return;
    isActive = true;
    heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    
    // Expose cho background service worker
    window.__gumballz_keepAlive = sendHeartbeat;
    
    console.log("[GumballZ] Session Keeper bat dau.");
  }

  /**
   * Dung Session Keeper
   */
  function stop() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    isActive = false;
    window.__gumballz_keepAlive = null;
    console.log("[GumballZ] Session Keeper da dung.");
  }

  // Theo doi su kien visibility de toi uu
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Tab bi an: giam tan suat (background alarm se dam nhan)
    } else {
      // Tab hien thi lai: gui heartbeat ngay
      syncStatus().then((status) => {
        if (status === "running") sendHeartbeat();
      });
    }
  });

  // Lang nghe message tu popup / background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "START_SESSION_KEEPER") start();
    if (message.action === "STOP_SESSION_KEEPER") stop();
  });

  // Tu dong bat dau neu trang thai la "running"
  syncStatus().then((status) => {
    if (status === "running") start();
  });

  // Expose API
  window.__gumballz_session_keeper = { start, stop, sendHeartbeat };
})();
