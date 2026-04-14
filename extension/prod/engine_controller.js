/**
 * GumballZ - Engine Controller (Bộ điều phối Engine - Plug-and-Play)
 * Nhận diện URL và kích hoạt engine tương ứng
 * Tác giả: Nguyễn Quốc Hưng - EIU Student
 *
 * Để thêm trường mới: Chỉ cần cập nhật /engines-manifest.js
 * rồi tạo file engine trong /prod/implementation/
 */

"use strict";

// Danh sách engine được quản lý tập trung trong engines-manifest.js
// Tại đây ta đọc từ window.GUMBALLZ_ENGINES nếu đã được inject,
// hoặc fallback sang bản sao cục bộ (để content script hoạt động độc lập)
const ENGINE_REGISTRY = (typeof window !== "undefined" && window.GUMBALLZ_ENGINES)
  ? window.GUMBALLZ_ENGINES
  : [
    // === FALLBACK nội tuyến (giữ đồng bộ với engines-manifest.js) ===
    {
      shortName:   "EIU",
      fullName:    "ĐH Quốc tế Miền Đông",
      file:        "eiu_engine.js",
      status:      "active",
      urlPatterns: ["eiu.edu.vn", "aqtea-eiu", "dkmh.eiu"]
    },
    {
      shortName:   "TDMU",
      fullName:    "ĐH Thủ Dầu Một",
      file:        "tdmu_engine.js",
      status:      "beta",
      urlPatterns: ["tdmu.edu.vn", "qldt.tdmu", "dkmh.tdmu"]
    },
    {
      shortName:   "TDTU",
      fullName:    "ĐH Tôn Đức Thắng",
      file:        null,
      status:      "soon",
      urlPatterns: ["tdtu.edu.vn", "dkmh.tdtu"]
    },
    {
      shortName:   "UEH",
      fullName:    "ĐH Kinh tế TP.HCM",
      file:        null,
      status:      "soon",
      urlPatterns: ["ueh.edu.vn", "dkmonhoc.ueh"]
    },
    {
      shortName:   "HCMUT",
      fullName:    "ĐH Bách Khoa TP.HCM",
      file:        null,
      status:      "research",
      urlPatterns: ["hcmut.edu.vn", "mybk.hcmut"]
    },
    {
      shortName:   "UIT",
      fullName:    "ĐH Công nghệ Thông tin",
      file:        null,
      status:      "research",
      urlPatterns: ["uit.edu.vn", "student.uit"]
    }
  ];

// ============================================================
// URL MATCHER
// ============================================================

/**
 * Tìm engine phù hợp với URL hiện tại
 * @param {string} url
 * @returns {{ entry: object, matched: boolean } | null}
 */
function findEngine(url) {
  if (!url) return null;
  const lowerUrl = url.toLowerCase();

  for (const entry of ENGINE_REGISTRY) {
    for (const pattern of entry.urlPatterns) {
      if (lowerUrl.includes(pattern.toLowerCase())) {
        return { entry, matched: true };
      }
    }
  }
  return { entry: null, matched: false };
}

// ============================================================
// ENGINE LOADER
// ============================================================

/**
 * Nạp và khởi chạy engine cho trang hiện tại
 */
async function loadAndActivateEngine() {
  const currentUrl = window.location.href;
  const result = findEngine(currentUrl);

  if (!result) return;

  if (!result.matched) {
    console.log("[GumballZ] Trang này không phù hợp với bất kỳ engine nào.");
    return;
  }

  const { entry } = result;

  if (!entry.file) {
    // Trường đã được liệt kê nhưng chưa có engine
    console.log(`[GumballZ] ${entry.fullName} đang được nghiên cứu phát triển.`);

    chrome.runtime.sendMessage({
      action:     "ENGINE_STATUS",
      status:     "in_development",
      schoolName: entry.fullName,
      shortName:  entry.shortName
    }).catch(() => {});
    return;
  }

  // Nạp file engine
  console.log(`[GumballZ] Đang nạp engine: ${entry.file} cho ${entry.fullName}`);

  try {
    const engineUrl = chrome.runtime.getURL(`prod/implementation/${entry.file}`);

    const script = document.createElement("script");
    script.src  = engineUrl;
    script.type = "text/javascript";

    script.onload = () => {
      console.log(`[GumballZ] Engine ${entry.shortName} đã được nạp thành công.`);

      chrome.runtime.sendMessage({
        action:     "ENGINE_STATUS",
        status:     "ready",
        schoolName: entry.fullName,
        shortName:  entry.shortName
      }).catch(() => {});

      window.__gumballz_engine_ready = true;
      window.__gumballz_school       = entry.shortName;
    };

    script.onerror = (e) => {
      console.error(`[GumballZ] Không thể nạp engine ${entry.file}:`, e);
    };

    (document.head || document.documentElement).appendChild(script);
  } catch (err) {
    console.error("[GumballZ] Lỗi khi nạp engine:", err);
  }
}

// ============================================================
// MESSAGE LISTENER (from popup)
// ============================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "DETECT_ENGINE") {
    const result = findEngine(window.location.href);
    sendResponse({
      url:        window.location.href,
      matched:    result?.matched || false,
      schoolName: result?.entry?.fullName || null,
      shortName:  result?.entry?.shortName || null,
      hasEngine:  !!(result?.entry?.file)
    });
    return true;
  }

  if (message.action === "GUMBALLZ_AUTO_START") {
    if (window.__gumballz_engine_ready) {
      window.dispatchEvent(new CustomEvent("gumballz:autostart"));
    }
  }
});

// ============================================================
// AUTO-DETECT khi trang load
// ============================================================
(function init() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAndActivateEngine);
  } else {
    loadAndActivateEngine();
  }
})();
