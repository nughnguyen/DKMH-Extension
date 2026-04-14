/**
 * GumballZ – Popup Controller
 * Xử lý logic giao diện popup extension
 * Tác giả: Nguyễn Quốc Hưng – EIU Student
 */

"use strict";

// ============================================================
// DOM REFS
// ============================================================
const $ = (id) => document.getElementById(id);

const el = {
  updateBanner:    $("gz-update-banner"),
  updateVersion:   $("gz-update-version"),
  updateNotes:     $("gz-update-notes"),
  statusBadge:     $("gz-status-badge"),
  detection:       $("gz-detection"),
  detectionText:   $("gz-detection-text"),
  schoolUrl:       $("gz-school-url"),
  username:        $("gz-username"),
  password:        $("gz-password"),
  togglePass:      $("gz-toggle-pass"),
  saveCreds:       $("gz-save-creds"),
  courseInput:     $("gz-course-input"),
  addCourseBtn:    $("gz-add-course"),
  courseTags:      $("gz-course-tags"),
  scheduleTime:    $("gz-schedule-time"),
  scheduleBtn:     $("gz-schedule-btn"),
  countdown:       $("gz-countdown"),
  countdownLabel:  $("gz-countdown-label"),
  startBtn:        $("gz-start-btn"),
  stopBtn:         $("gz-stop-btn"),
  progressCard:    $("gz-progress-card"),
  progressBar:     $("gz-progress-bar"),
  attemptLabel:    $("gz-attempt-label"),
  attemptCount:    $("gz-attempt-count"),
  log:             $("gz-log"),
  settingsToggle:  $("gz-settings-toggle"),
  settingsSection: $("gz-settings-section"),
  settingsArrow:   $("gz-settings-arrow"),
  stealthToggle:   $("gz-toggle-stealth"),
  maxRetries:      $("gz-max-retries"),
  tgToken:         $("gz-tg-token"),
  tgChat:          $("gz-tg-chat"),
  saveSettings:    $("gz-save-settings"),
  testTg:          $("gz-test-tg"),
  toast:           $("gz-toast")
};

// ============================================================
// STATE
// ============================================================
let state = {
  courses:    [],   // Danh sach ma mon hoc
  isRunning:  false,
  status:     "idle",
  engineInfo: null,
  hasEngine:  false,
  stealth:    true,
  scheduledCountdown: null
};

// ============================================================
// INIT
// ============================================================
async function init() {
  await loadFromStorage();
  renderCourseTags();
  detectEngine();
  bindEvents();
  listenToBackgroundMessages();
}

// ============================================================
// STORAGE
// ============================================================
async function loadFromStorage() {
  const data = await chrome.storage.local.get([
    "gumballz_credentials",
    "gumballz_settings",
    "gumballz_courses",
    "gumballz_status",
    "gumballz_scheduled_time",
    "gumballz_update_info",
    "gumballz_dismissed_update"
  ]);

  // Hien thi cap nhat neu co bai
  if (data.gumballz_update_info) {
    const localVer = chrome.runtime.getManifest().version;
    const remoteVer = data.gumballz_update_info.version.replace('v', '');
    
    if (localVer === remoteVer) {
      // Đã cập nhật xong -> xóa info update và badge
      chrome.storage.local.remove("gumballz_update_info");
      chrome.action.setBadgeText({ text: "" });
    } else if (data.gumballz_update_info.version !== data.gumballz_dismissed_update) {
      el.updateVersion.textContent = data.gumballz_update_info.version;
      let notes = data.gumballz_update_info.notes || "";
      notes = notes.length > 80 ? notes.substring(0, 80) + '...' : notes;
      el.updateNotes.textContent = notes;
      el.updateBanner.style.display = 'flex';

      // Nút ẩn cảnh báo (dismiss)
      const dismissBtn = $("gz-dismiss-update");
      if (dismissBtn) {
        dismissBtn.onclick = () => {
          chrome.storage.local.set({ gumballz_dismissed_update: data.gumballz_update_info.version });
          el.updateBanner.style.display = 'none';
        };
      }
    }
  }

  const creds    = data.gumballz_credentials || {};
  const settings = data.gumballz_settings    || {};
  const courses  = data.gumballz_courses      || [];

  // Dien vao form
  if (creds.url)      el.schoolUrl.value = creds.url;
  if (creds.username) el.username.value  = creds.username;
  if (creds.password) el.password.value  = creds.password;


  // Cai dat
  state.courses = courses;
  state.stealth = settings.stealth !== false;
  if (!state.stealth) el.stealthToggle.classList.remove("on");
  if (settings.maxRetries) el.maxRetries.value  = settings.maxRetries;
  if (settings.telegramBotToken) el.tgToken.value = settings.telegramBotToken;
  if (settings.telegramChatId)   el.tgChat.value  = settings.telegramChatId;

  // Trang thai
  const status = data.gumballz_status || "idle";
  updateStatusBadge(status);
  if (status === "running") {
    state.isRunning = true;
    showProgress();
  }

  // Scheduled time
  if (data.gumballz_scheduled_time) {
    el.scheduleTime.value = data.gumballz_scheduled_time.slice(0, 16);
    startCountdownDisplay(data.gumballz_scheduled_time);
  }
}

async function saveCredentials() {
  const credentials = {
    url:      el.schoolUrl.value.trim(),
    username: el.username.value.trim(),
    password: el.password.value
  };
  await chrome.storage.local.set({ gumballz_credentials: credentials });
  await chrome.runtime.sendMessage({ action: "SAVE_CREDENTIALS", credentials });
  showToast("Đã lưu thông tin đăng nhập", "success");
}

async function saveSettings() {
  const settings = {
    stealth:           state.stealth,
    maxRetries:        parseInt(el.maxRetries.value) || 10,
    telegramBotToken:  el.tgToken.value.trim(),
    telegramChatId:    el.tgChat.value.trim()
  };
  await chrome.storage.local.set({ gumballz_settings: settings });
  showToast("Đã lưu cài đặt", "success");
}

// ============================================================
// ENGINE DETECTION
// ============================================================
async function detectEngine() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    const response = await chrome.tabs.sendMessage(tab.id, { action: "DETECT_ENGINE" });
    updateDetectionBanner(response);
  } catch {
    // Tab chưa có content script (trang mới, chrome://, v.v.)
    setDetection("not-found", "?", "Mở trang web trường học để nhận diện");
  }
}

function updateDetectionBanner(info) {
  if (!info) {
    setDetection("not-found", "?", "Không thể kiểm tra trang này");
    return;
  }

  if (info.matched && info.hasEngine) {
    setDetection("found", "✓", `Đã nhận diện: ${info.schoolName}`);
    state.engineInfo = info;
    state.hasEngine  = true;
  } else if (info.matched && !info.hasEngine) {
    setDetection("dev", "!", `${info.schoolName} đang được nghiên cứu phát triển`);
    state.hasEngine = false;
  } else {
    setDetection("not-found", "?", "Trường này chưa được hỗ trợ hoặc dán URL vào ô phía trên");
    state.hasEngine = false;
  }
}

function setDetection(type, icon, text) {
  el.detection.className = `gz-detection ${type}`;
  el.detection.querySelector(".gz-detection-icon").textContent = icon;
  el.detectionText.textContent = text;
}

// ============================================================
// COURSE TAGS
// ============================================================
function renderCourseTags() {
  el.courseTags.innerHTML = "";
  state.courses.forEach((code) => {
    const tag = document.createElement("span");
    tag.className = "gz-tag";
    tag.textContent = code;

    const removeBtn = document.createElement("button");
    removeBtn.className = "gz-tag-remove";
    removeBtn.innerHTML = "&times;";
    removeBtn.title = `Xóa ${code}`;
    removeBtn.onclick = () => removeCourse(code);

    tag.appendChild(removeBtn);
    el.courseTags.appendChild(tag);
  });
}

function addCourse() {
  const code = el.courseInput.value.trim().toUpperCase();
  if (!code) return;
  if (state.courses.includes(code)) {
    showToast(`${code} đã có trong danh sách`, "error");
    return;
  }
  state.courses.push(code);
  chrome.storage.local.set({ gumballz_courses: state.courses });
  renderCourseTags();
  el.courseInput.value = "";
  el.courseInput.focus();
}

function removeCourse(code) {
  state.courses = state.courses.filter((c) => c !== code);
  chrome.storage.local.set({ gumballz_courses: state.courses });
  renderCourseTags();
}

// ============================================================
// SCHEDULER / COUNTDOWN
// ============================================================
async function handleSchedule() {
  const timeVal = el.scheduleTime.value;
  if (!timeVal) { showToast("Vui lòng chọn thời gian", "error"); return; }

  const isoTime = new Date(timeVal).toISOString();
  const result  = await chrome.runtime.sendMessage({ action: "SCHEDULE_START", isoTime });

  if (result?.ok) {
    await chrome.storage.local.set({ gumballz_scheduled_time: isoTime });
    startCountdownDisplay(isoTime);
    showToast("Đã đặt hẹn giờ thành công", "success");
    el.scheduleBtn.textContent = "Hủy";
    el.scheduleBtn.onclick = cancelSchedule;
  } else {
    showToast("Thời gian đặt hẹn không hợp lệ", "error");
  }
}

async function cancelSchedule() {
  await chrome.runtime.sendMessage({ action: "CANCEL_SCHEDULE" });
  await chrome.storage.local.remove("gumballz_scheduled_time");
  stopCountdownDisplay();
  el.scheduleBtn.textContent = "Đặt Giờ";
  el.scheduleBtn.onclick = handleSchedule;
  showToast("Đã hủy hẹn giờ");
}

function startCountdownDisplay(isoTime) {
  const target = new Date(isoTime).getTime();
  el.countdown.classList.add("visible");
  el.countdownLabel.textContent = "Thời gian còn lại đến khi bắt đầu";

  if (state.scheduledCountdown) clearInterval(state.scheduledCountdown);

  state.scheduledCountdown = setInterval(() => {
    const remaining = target - Date.now();
    if (remaining <= 0) {
      el.countdown.textContent = "00:00:00";
      stopCountdownDisplay();
      return;
    }
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    el.countdown.textContent = [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  }, 1000);
}

function stopCountdownDisplay() {
  if (state.scheduledCountdown) {
    clearInterval(state.scheduledCountdown);
    state.scheduledCountdown = null;
  }
  el.countdown.classList.remove("visible");
  el.countdownLabel.textContent = "";
}

// ============================================================
// REGISTRATION CONTROL
// ============================================================
async function startRegistration() {
  if (state.isRunning) return;

  if (state.courses.length === 0) {
    showToast("Thêm ít nhất 1 mã môn học", "error");
    return;
  }
  if (!el.schoolUrl.value.trim()) {
    showToast("Nhập URL trường học", "error");
    return;
  }
  if (!el.username.value.trim() || !el.password.value) {
    showToast("Nhập tài khoản và mật khẩu", "error");
    return;
  }

  // Lưu credentials
  await saveCredentials();

  state.isRunning = true;
  el.startBtn.classList.add("loading");
  el.startBtn.disabled = true;
  el.stopBtn.disabled  = false;
  showProgress();
  updateStatusBadge("running");
  addLog(`Bắt đầu đăng ký ${state.courses.length} môn học...`);

  // Gửi lệnh đến content script để bắt đầu
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.tabs.sendMessage(tab.id, {
        action:    "GUMBALLZ_START",
        courses:   state.courses,
        options: {
          maxRetries: parseInt(el.maxRetries.value) || 10,
          stealth:    state.stealth
        }
      });
    }
  } catch (err) {
    addLog(`Không thể kết nối đến trang. Mở trang trường trước.`, "error");
    stopRegistration();
    return;
  }

  await chrome.runtime.sendMessage({ action: "UPDATE_STATUS", status: "running" });
  await chrome.runtime.sendMessage({ action: "START_HEARTBEAT" });
}

function stopRegistration() {
  state.isRunning = false;
  el.startBtn.classList.remove("loading");
  el.startBtn.disabled = false;
  el.stopBtn.disabled  = true;
  updateStatusBadge("idle");

  chrome.runtime.sendMessage({ action: "UPDATE_STATUS", status: "idle" });
  chrome.runtime.sendMessage({ action: "STOP_HEARTBEAT" });

  // Notify content script
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab?.id) chrome.tabs.sendMessage(tab.id, { action: "GUMBALLZ_STOP" }).catch(() => {});
  });

  addLog("Đã dừng đăng ký.");
}

// ============================================================
// PROGRESS UI
// ============================================================
function showProgress() {
  el.progressCard.classList.add("visible");
}

function updateProgress(attempt, max) {
  const pct = max > 0 ? (attempt / max) * 100 : 0;
  el.progressBar.classList.remove("indeterminate");
  el.progressBar.style.width = `${pct}%`;
  el.attemptLabel.textContent = `Lần thử ${attempt}...`;
  el.attemptCount.textContent = `${attempt} / ${max}`;
}

function addLog(msg, type = "") {
  const entry = document.createElement("span");
  entry.className = `gz-log-entry ${type}`;
  const time = new Date().toLocaleTimeString("vi-VN");
  entry.textContent = `[${time}] ${msg}`;
  el.log.appendChild(entry);
  el.log.appendChild(document.createElement("br"));
  el.log.scrollTop = el.log.scrollHeight;
}

// ============================================================
// STATUS BADGE
// ============================================================
function updateStatusBadge(status) {
  const labels = {
    idle:    "Sẵn sàng",
    running: "Đang chạy",
    success: "Thành công",
    failed:  "Thất bại"
  };
  el.statusBadge.className = `gz-badge ${status}`;
  el.statusBadge.textContent = labels[status] || status;
  state.status = status;
}

// ============================================================
// TOAST
// ============================================================
let _toastTimer;
function showToast(msg, type = "") {
  el.toast.textContent = msg;
  el.toast.className   = `gz-toast ${type} show`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    el.toast.classList.remove("show");
  }, 2800);
}

// ============================================================
// PASSWORD TOGGLE
// ============================================================
function togglePasswordVisibility() {
  const isPass = el.password.type === "password";
  el.password.type = isPass ? "text" : "password";
  const svgPath = el.togglePass.querySelector("#gz-eye-icon");
  if (!isPass) {
    svgPath.setAttribute("d", "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z");
  } else {
    svgPath.setAttribute("d", "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22");
  }
}

// ============================================================
// BACKGROUND MESSAGE LISTENER
// ============================================================
function listenToBackgroundMessages() {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "ENGINE_STATUS") {
      updateDetectionBanner(message);
    }
  });

  // Lắng nghe events từ content script qua storage polling
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.gumballz_status) {
      const newStatus = changes.gumballz_status.newValue;
      updateStatusBadge(newStatus);
      if (newStatus === "success") {
        addLog("Đăng ký thành công!", "success");
        stopRegistration();
        showToast("Đã đăng ký thành công!", "success");
      } else if (newStatus === "failed") {
        addLog("Đã hết số lần thử. Thất bại.", "error");
        stopRegistration();
        showToast("Đăng ký thất bại", "error");
      }
    }
  });
}

// Lắng nghe sự kiện từ content script (gumballz window events)
window.addEventListener("message", (e) => {
  if (e.data?.source !== "gumballz") return;
  switch (e.data.type) {
    case "attempt":
      updateProgress(e.data.attempt, e.data.max);
      addLog(`Thử lần ${e.data.attempt}/${e.data.max}: ${e.data.message || ""}`);
      break;
    case "success":
      addLog(`Thành công: ${e.data.message}`, "success");
      break;
    case "error":
      addLog(`Lỗi: ${e.data.message}`, "error");
      break;
  }
});

// ============================================================
// EVENT BINDING
// ============================================================
function bindEvents() {
  // Password toggle
  el.togglePass.addEventListener("click", togglePasswordVisibility);

  // Save credentials
  el.saveCreds.addEventListener("click", saveCredentials);

  // Course management
  el.addCourseBtn.addEventListener("click", addCourse);
  el.courseInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addCourse();
  });

  // URL change -> re-detect
  el.schoolUrl.addEventListener("change", detectEngine);

  // Scheduler
  el.scheduleBtn.addEventListener("click", handleSchedule);

  // Start / Stop
  el.startBtn.addEventListener("click", startRegistration);
  el.stopBtn.addEventListener("click", stopRegistration);

  // Settings toggle
  el.settingsToggle.addEventListener("click", () => {
    const isOpen = el.settingsSection.classList.toggle("open");
    el.settingsArrow.style.transform = isOpen ? "rotate(180deg)" : "";
  });

  // Stealth toggle
  el.stealthToggle.addEventListener("click", () => {
    state.stealth = !state.stealth;
    el.stealthToggle.classList.toggle("on", state.stealth);
  });

  // Save settings
  el.saveSettings.addEventListener("click", saveSettings);

  // Test Telegram
  el.testTg.addEventListener("click", async () => {
    const token  = el.tgToken.value.trim();
    const chatId = el.tgChat.value.trim();
    if (!token || !chatId) {
      showToast("Nhập Bot Token và Chat ID", "error");
      return;
    }
    el.testTg.textContent = "Đang test...";
    el.testTg.disabled = true;

    try {
      const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          chat_id: chatId,
          text:    "GumballZ – Kết nối Telegram thành công! Bot đang hoạt động bình thường."
        })
      });
      const data = await resp.json();
      showToast(data.ok ? "Telegram kết nối thành công!" : `Lỗi: ${data.description}`, data.ok ? "success" : "error");
    } catch (e) {
      showToast("Kết nối Telegram thất bại", "error");
    } finally {
      el.testTg.textContent = "Test Telegram";
      el.testTg.disabled = false;
    }
  });
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener("DOMContentLoaded", init);
