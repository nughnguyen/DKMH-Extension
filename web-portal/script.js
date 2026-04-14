/**
 * GumballZ Landing Page – Script
 * Render universities từ engines-manifest.js, server status, QR, copy STK
 * Tác giả: Nguyễn Quốc Hưng – EIU Student
 */

"use strict";

// ============================================================
// ENGINES: Đọc từ engines-manifest.js (window.GUMBALLZ_ENGINES)
// Nếu chưa load được, dùng mảng rỗng để tránh lỗi
// ============================================================
const ENGINES = window.GUMBALLZ_ENGINES || [];

// ============================================================
// THỐNG KÊ: Tính số trường theo trạng thái
// ============================================================
function getEngineStats() {
  const active   = ENGINES.filter(e => e.status === "active").length;
  const beta     = ENGINES.filter(e => e.status === "beta").length;
  const hasEngine = ENGINES.filter(e => e.file !== null).length; // active + beta
  const total    = ENGINES.length;
  return { active, beta, hasEngine, total };
}

// Cập nhật stat counter trên Hero section
function updateHeroStats() {
  const stats = getEngineStats();
  const el = document.getElementById("stat-active-count");
  if (!el) return;

  // Hiển thị tổng số trường có engine (active + beta)
  el.textContent = stats.hasEngine;
  el.setAttribute("data-count", stats.hasEngine);

  // Cập nhật phụ đề section trường học
  const subtitle = document.getElementById("unis-subtitle");
  if (subtitle) {
    subtitle.textContent =
      `Hiện có ${stats.hasEngine} trường với engine hoàn chỉnh và ${stats.total - stats.hasEngine} trường đang nghiên cứu. ` +
      `Sinh viên trường khác có thể đóng góp engine qua GitHub.`;
  }
}

// ============================================================
// UNIVERSITIES GRID: Render từ GUMBALLZ_ENGINES
// ============================================================
function renderUniversities() {
  const grid = document.getElementById("gz-unis-grid");
  if (!grid) return;

  grid.innerHTML = "";

  // Render từng trường theo thứ tự: active > beta > soon > research
  const order = { active: 0, beta: 1, soon: 2, research: 3 };
  const sorted = [...ENGINES].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));

  sorted.forEach((eng, i) => {
    const card = document.createElement("div");
    card.className = "gz-uni-card gz-fade-in";
    card.id        = `uni-${eng.shortName.toLowerCase()}`;
    card.style.animationDelay = `${i * 0.06}s`;

    const isActive = eng.file !== null;

    card.innerHTML = `
      <div class="gz-uni-abbr${isActive ? "" : " dev"}">${eng.shortName}</div>
      <div class="gz-uni-info" data-tooltip="${eng.fullName}">
        <div class="gz-uni-name">${eng.fullName}</div>
        <span class="gz-uni-status ${eng.status}">${eng.statusLabel}</span>
      </div>
    `;

    grid.appendChild(card);
  });

  // Nút đóng góp luôn ở cuối
  const contributeCard = document.createElement("div");
  contributeCard.className = "gz-uni-card gz-fade-in";
  contributeCard.id        = "uni-contribute";
  contributeCard.innerHTML = `
    <div class="gz-uni-abbr" style="background: var(--c-surface); color: var(--c-primary);">+</div>
    <div class="gz-uni-info">
      <div class="gz-uni-name" style="color: var(--c-primary);">Trường của bạn?</div>
      <a href="https://github.com/nughnguyen/DKMH-Extension/blob/main/CONTRIBUTING.md"
         target="_blank" style="font-size:12px;font-weight:600;">Đóng góp engine</a>
    </div>
  `;
  grid.appendChild(contributeCard);

  // Kích hoạt fade-in observer cho các card mới
  grid.querySelectorAll(".gz-fade-in").forEach(el => fadeObserver.observe(el));
}

// ============================================================
// SERVER STATUS MOCK (dựa trên danh sách trường đang hoạt động)
// ============================================================
const STATUS_VARIANTS = [
  { status: "ok",   label: "Hoạt động bình thường" },
  { status: "ok",   label: "Hoạt động bình thường" },
  { status: "ok",   label: "Hoạt động bình thường" },
  { status: "busy", label: "Đang tải cao – có thể chậm" },
  { status: "busy", label: "Server đông – thử lại sau" },
  { status: "down", label: "Không kết nối được" }
];

function renderServerStatus() {
  const grid    = document.getElementById("gz-status-grid");
  const updated = document.getElementById("gz-status-updated");
  if (!grid) return;

  grid.innerHTML = "";

  // Chỉ hiển thị trường đã có engine (active + beta)
  const activeEngines = ENGINES.filter(e => e.file !== null);

  activeEngines.forEach(eng => {
    const variant = STATUS_VARIANTS[Math.floor(Math.random() * STATUS_VARIANTS.length)];

    const card = document.createElement("div");
    card.className = "gz-server-card";
    card.id        = `server-${eng.shortName.toLowerCase()}`;
    card.innerHTML = `
      <div class="gz-server-dot ${variant.status} pulse"></div>
      <div class="gz-server-info">
        <div class="gz-server-name">${eng.shortName}</div>
        <div class="gz-server-sub">${variant.label}</div>
      </div>
    `;
    grid.appendChild(card);
  });

  if (updated) {
    const now = new Date().toLocaleTimeString("vi-VN");
    updated.textContent = `Cập nhật lần cuối: ${now} (tự động mỗi 30 giây)`;
  }
}

// ============================================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================================
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".gz-fade-in").forEach(el => fadeObserver.observe(el));

// ============================================================
// ACTIVE NAV LINK
// ============================================================
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".gz-nav-link");

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color      = "";
        link.style.background = "";
      });
      const active = document.querySelector(`.gz-nav-link[href="#${entry.target.id}"]`);
      if (active) {
        active.style.color      = "var(--c-primary)";
        active.style.background = "var(--c-primary-l)";
      }
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ============================================================
// NAV SHADOW ON SCROLL
// ============================================================
window.addEventListener("scroll", () => {
  const nav = document.getElementById("gz-nav");
  if (nav) {
    nav.style.boxShadow = window.scrollY > 10
      ? "0 2px 16px rgba(79, 110, 247, 0.1)"
      : "";
  }
}, { passive: true });

// ============================================================
// COPY STK
// ============================================================
window.copySTK = function () {
  const stk    = document.getElementById("gz-stk")?.textContent.trim();
  const button = document.getElementById("copy-stk-btn");

  navigator.clipboard.writeText(stk)
    .then(() => {
      if (button) {
        const original = button.textContent;
        button.textContent  = "Đã sao chép";
        button.style.color  = "var(--c-success)";
        setTimeout(() => {
          button.textContent = original;
          button.style.color = "";
        }, 2000);
      }
    })
    .catch(() => {
      // Fallback cho trình duyệt cũ
      const ta    = document.createElement("textarea");
      ta.value    = stk;
      ta.style.cssText = "position:fixed;opacity:0;";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
};

// ============================================================
// DYNAMIC QR THEO SỐ TIỀN
// ============================================================
const QR_BASE    = "https://img.vietqr.io/image/OCB-0388205003-qr_only.png";
const QR_NAME    = "NGUYEN QUOC HUNG";
const QR_NOTE    = "Donate GumballZ";

window.selectAmount = function (amount) {
  document.querySelectorAll(".gz-amount-btn").forEach(btn => {
    btn.classList.toggle("active", parseInt(btn.dataset.amount) === amount);
  });
  
  // Clear custom input field when a preset button is clicked
  const customInput = document.getElementById("gz-custom-amount");
  if (customInput) customInput.value = "";

  const qrImg = document.getElementById("gz-qr-img");
  if (qrImg) {
    const params = new URLSearchParams({
      accountName: QR_NAME,
      amount:      amount,
      addInfo:     QR_NOTE
    });
    qrImg.src = `${QR_BASE}?${params}`;
    qrImg.style.display = "block";
    const fallback = document.getElementById("gz-qr-fallback");
    if (fallback) fallback.style.display = "none";
  }
};

window.downloadQR = async function() {
  const qrImg = document.getElementById("gz-qr-img");
  if (!qrImg || qrImg.style.display === "none" || !qrImg.src) return;

  try {
    const response = await fetch(qrImg.src);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `GumballZ_QR_ThanhToan.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);

    // Optional visual feedback on button
    const btn = document.getElementById("gz-download-qr");
    if (btn) {
      btn.style.transform = "scale(0.9)";
      setTimeout(() => btn.style.transform = "none", 150);
    }
  } catch (err) {
    console.error("Lỗi khi tải mã QR:", err);
    alert("Không thể tải mã QR lúc này. Vui lòng quét trực tiếp.");
  }
};

// ============================================================
// SỐ ĐẾM ĐỘNG (counter animation)
// ============================================================
function animateCounter(el, target, duration = 1200) {
  const stepTime  = 16;
  const steps     = duration / stepTime;
  const increment = target / steps;
  let current     = 0;

  const update = () => {
    current += increment;
    if (current >= target) { el.textContent = target; return; }
    el.textContent = Math.floor(current);
    requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.count);
      if (!isNaN(target)) animateCounter(entry.target, target);
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

// ============================================================
// KHỞI ĐỘNG (DOMContentLoaded)
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Tính và hiển thị số trường từ engines-manifest.js
  updateHeroStats();

  // 2. Render university grid
  renderUniversities();

  // 3. Server status
  renderServerStatus();
  setInterval(renderServerStatus, 30000);

  // 4. Counter animation cho stat-active-count
  const statEl = document.getElementById("stat-active-count");
  if (statEl) counterObs.observe(statEl);

  // 5. Counter animation cho các stat khác
  document.querySelectorAll("[data-count]").forEach(el => counterObs.observe(el));
  
  // 6. Listener for custom amount input
  const customInput = document.getElementById("gz-custom-amount");
  if (customInput) {
    customInput.addEventListener("input", (e) => {
      const val = parseInt(e.target.value);
      if (!isNaN(val) && val > 0) {
        // Deselect preset buttons
        document.querySelectorAll(".gz-amount-btn").forEach(btn => btn.classList.remove("active"));
        
        // Update QR
        const qrImg = document.getElementById("gz-qr-img");
        if (qrImg) {
          const params = new URLSearchParams({
            accountName: QR_NAME,
            amount:      val,
            addInfo:     QR_NOTE
          });
          qrImg.src = `${QR_BASE}?${params}`;
          qrImg.style.display = "block";
          const fallback = document.getElementById("gz-qr-fallback");
          if (fallback) fallback.style.display = "none";
        }
      }
    });
  }
});
