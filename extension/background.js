/**
 * GumballZ - Background Service Worker
 * Quan ly: Alarms (Scheduled Start), Notifications, Storage sync
 * Tac gia: Nguyen Quoc Hung - EIU Student
 */

"use strict";

// ============================================================
// CONSTANTS
// ============================================================
const ALARM_SESSION_HEARTBEAT = "gumballz_heartbeat";
const ALARM_SCHEDULED_START   = "gumballz_scheduled_start";
const ALARM_UPDATE_CHECKER    = "gumballz_update_checker";
const HEARTBEAT_INTERVAL_MIN  = 4; // Chrome alarm min = 1 phut

// ============================================================
// INSTALL / UPDATE
// ============================================================
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    console.log("[GumballZ] Extension da duoc cai dat thanh cong.");
    // Set gia tri mac dinh
    chrome.storage.local.set({
      gumballz_settings: {
        version: "1.0.0",
        stealth: true,
        minDelay: 800,
        maxDelay: 2500,
        maxRetries: 10,
        telegramBotToken: "",
        telegramChatId: "",
        scheduledTime: null
      },
      gumballz_credentials: {}, // { url, username, password }
      gumballz_status: "idle"   // idle | running | success | failed
    });
    _showNotification("GumballZ da san sang", "Nhan bieu tuong tren toolbar de bat dau.");
  }
});

// ============================================================
// ALARM MANAGEMENT
// ============================================================

/**
 * Khoi dong Session Heartbeat alarm
 */
function startHeartbeatAlarm() {
  chrome.alarms.create(ALARM_SESSION_HEARTBEAT, {
    periodInMinutes: HEARTBEAT_INTERVAL_MIN
  });
  console.log(`[GumballZ] Heartbeat alarm created, interval: ${HEARTBEAT_INTERVAL_MIN}m`);
}

/**
 * Dat hen gio Scheduled Start
 * @param {string} isoTimeString - ISO 8601 datetime string
 */
function scheduleStart(isoTimeString) {
  const targetTime = new Date(isoTimeString).getTime();
  const now = Date.now();
  if (targetTime <= now) {
    console.warn("[GumballZ] Thoi gian hen gio da qua.");
    return false;
  }
  chrome.alarms.create(ALARM_SCHEDULED_START, {
    when: targetTime
  });
  console.log(`[GumballZ] Scheduled Start dat luc: ${isoTimeString}`);
  return true;
}

/**
 * Huy hen gio Scheduled Start
 */
function cancelScheduledStart() {
  chrome.alarms.clear(ALARM_SCHEDULED_START);
  console.log("[GumballZ] Scheduled Start da bi huy.");
}

// Xu ly khi alarm keo
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_SESSION_HEARTBEAT) {
    await _handleHeartbeat();
  } else if (alarm.name === ALARM_SCHEDULED_START) {
    await _handleScheduledStart();
  } else if (alarm.name === ALARM_UPDATE_CHECKER) {
    await _checkForUpdates();
  }
});

// ============================================================
// ALARM HANDLERS
// ============================================================

async function _handleHeartbeat() {
  const { gumballz_credentials, gumballz_status } = await chrome.storage.local.get([
    "gumballz_credentials",
    "gumballz_status"
  ]);
  if (gumballz_status !== "running") return;
  if (!gumballz_credentials?.url) return;

  // Inject heartbeat vao tab dang chay
  const tabs = await chrome.tabs.query({ url: `*://*.${_extractDomain(gumballz_credentials.url)}/*` });
  for (const tab of tabs) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Trigger session keeper neu co
          if (window.__gumballz_keepAlive) {
            window.__gumballz_keepAlive();
          }
        }
      });
    } catch (e) {
      console.warn("[GumballZ] Heartbeat inject that bai:", e.message);
    }
  }
}

async function _handleScheduledStart() {
  console.log("[GumballZ] Scheduled Start dang duoc kich hoat...");
  _showNotification("GumballZ Bat Dau", "Dang ky mon hoc tu dong da bat dau theo lich.");

  const { gumballz_credentials } = await chrome.storage.local.get("gumballz_credentials");
  if (!gumballz_credentials?.url) {
    console.warn("[GumballZ] Khong co URL de mo. Vui long cau hinh truoc.");
    return;
  }

  // Mo tab moi voi URL truong
  const tab = await chrome.tabs.create({ url: gumballz_credentials.url, active: true });

  // Cap nhat trang thai
  await chrome.storage.local.set({ gumballz_status: "running" });

  // GUI message den tab sau khi load xong
  chrome.tabs.onUpdated.addListener(function onTabUpdated(tabId, changeInfo) {
    if (tabId === tab.id && changeInfo.status === "complete") {
      chrome.tabs.onUpdated.removeListener(onTabUpdated);
      chrome.tabs.sendMessage(tabId, { action: "GUMBALLZ_AUTO_START" });
    }
  });
}

async function _checkForUpdates() {
  try {
    const localVer = chrome.runtime.getManifest().version;
    
    // Xóa badge nếu version thực tế đã khớp (trước khi gọi API để phòng lỗi rate limit)
    const store = await chrome.storage.local.get("gumballz_update_info");
    if (store.gumballz_update_info) {
      const cachedVer = store.gumballz_update_info.version.replace('v', '');
      if (cachedVer === localVer) {
        await chrome.storage.local.remove("gumballz_update_info");
        chrome.action.setBadgeText({ text: "" });
      }
    }

    const res = await fetch("https://api.github.com/repos/nughnguyen/DKMH-Extension/releases/latest");
    if (!res.ok) return;
    const data = await res.json();
    
    // So sanh phien ban: Xoa chu 'v' neu co (vd 'v1.0.1' -> '1.0.1')
    const remoteVer = data.tag_name.replace('v', '');

    // Kiem tra thu cong chuoi phien ban don gian (gia su hinh thuc x.y.z)
    if (remoteVer !== localVer) {
      await chrome.storage.local.set({
        gumballz_update_info: {
          version: data.tag_name,
          notes: data.body,
          url: data.html_url
        }
      });
      // Kiem tra xem nguoi dung da an thong bao update nay chua
      const { gumballz_dismissed_update } = await chrome.storage.local.get("gumballz_dismissed_update");
      if (gumballz_dismissed_update !== data.tag_name) {
        chrome.action.setBadgeText({ text: "NEW" });
        try { chrome.action.setBadgeBackgroundColor({ color: "#ef4444" }); } catch(e){}
      } else {
        chrome.action.setBadgeText({ text: "" }); // Đã ẩn thì không hiện badge
      }
    } else {
      await chrome.storage.local.remove("gumballz_update_info");
      chrome.action.setBadgeText({ text: "" });
    }
  } catch (err) {
    console.warn("[GumballZ] Khong the kiem tra ban cap nhat:", err);
  }
}

// ============================================================
// MESSAGE HANDLER (from popup / content scripts)
// ============================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    switch (message.action) {
      case "START_HEARTBEAT":
        startHeartbeatAlarm();
        sendResponse({ ok: true });
        break;

      case "STOP_HEARTBEAT":
        chrome.alarms.clear(ALARM_SESSION_HEARTBEAT);
        sendResponse({ ok: true });
        break;

      case "SCHEDULE_START":
        const ok = scheduleStart(message.isoTime);
        sendResponse({ ok });
        break;

      case "CANCEL_SCHEDULE":
        cancelScheduledStart();
        sendResponse({ ok: true });
        break;

      case "SHOW_NOTIFICATION":
        _showNotification(message.title, message.body);
        sendResponse({ ok: true });
        break;

      case "GET_SETTINGS":
        const data = await chrome.storage.local.get("gumballz_settings");
        sendResponse({ settings: data.gumballz_settings });
        break;

      case "SAVE_CREDENTIALS":
        await chrome.storage.local.set({ gumballz_credentials: message.credentials });
        sendResponse({ ok: true });
        break;

      case "UPDATE_STATUS":
        await chrome.storage.local.set({ gumballz_status: message.status });
        sendResponse({ ok: true });
        break;

      default:
        sendResponse({ ok: false, error: "Unknown action" });
    }
  })();
  return true; // Giu message channel mo cho async response
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function _showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "assets/icon48.png",
    title: `[GumballZ] ${title}`,
    message,
    priority: 2
  });
}

function _extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

// Khoi dong heartbeat ngay khi service worker bat dau (neu dang chay)
chrome.storage.local.get("gumballz_status", ({ gumballz_status }) => {
  if (gumballz_status === "running") {
    startHeartbeatAlarm();
  }
});

// Setup Update Checker
chrome.alarms.create(ALARM_UPDATE_CHECKER, { periodInMinutes: 240 }); // check moi 4 tieng
_checkForUpdates(); // check ngay luc mo

