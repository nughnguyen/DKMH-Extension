/**
 * GumballZ - Engines Manifest (Nguồn dữ liệu duy nhất)
 * =======================================================
 * Đây là nguồn sự thật duy nhất (Single Source of Truth) cho
 * danh sách các trường đại học được hỗ trợ.
 *
 * QUAN TRỌNG: File này được dùng ở 2 nơi:
 *   - /engines-manifest.js          (dùng bởi extension)
 *   - /web-portal/engines-manifest.js (bản copy cho landing page)
 *
 * Sau khi thêm engine mới, chạy lệnh sau để đồng bộ:
 *   Copy-Item engines-manifest.js web-portal\engines-manifest.js
 *
 * Để thêm trường mới:
 *   1. Tạo file engine trong /extension/prod/implementation/
 *   2. Thêm một entry vào mảng GUMBALLZ_ENGINES bên dưới
 *   3. Chạy lệnh copy ở trên để đồng bộ với Landing Page
 *   4. Số trường trên Landing Page sẽ tự động cập nhật
 *
 * Tác giả: Nguyễn Quốc Hưng - EIU Student
 */

/* global module */

const GUMBALLZ_ENGINES = [
  // ==================== ĐANG HOẠT ĐỘNG ====================
  {
    shortName:  "EIU",
    fullName:   "ĐH Quốc tế Miền Đông (Eastern International University)",
    file:       "eiu_engine.js",
    status:     "active",          // active | beta | soon | research
    statusLabel:"Đang hoạt động",
    system:     "AQTech",
    urlPatterns: ["eiu.edu.vn", "aqtea-eiu", "dkmh.eiu"],
    addedDate:  "2026-04-13"
  },

  // ==================== BETA ====================
  {
    shortName:  "TDMU",
    fullName:   "ĐH Thủ Dầu Một (Thu Dau Mot University)",
    file:       "tdmu_engine.js",
    status:     "beta",
    statusLabel:"Beta",
    system:     "AQTech",
    urlPatterns: ["tdmu.edu.vn", "qldt.tdmu", "dkmh.tdmu"],
    addedDate:  "2026-04-13"
  },

  // ==================== SẮP RA MẮT ====================
  {
    shortName:  "TDTU",
    fullName:   "ĐH Tôn Đức Thắng (Ton Duc Thang University)",
    file:       null,
    status:     "soon",
    statusLabel:"Sắp ra mắt",
    system:     "AQTech",
    urlPatterns: ["tdtu.edu.vn", "dkmh.tdtu"],
    addedDate:  null
  },
  {
    shortName:  "UEH",
    fullName:   "ĐH Kinh tế TP.HCM (University of Economics)",
    file:       null,
    status:     "soon",
    statusLabel:"Sắp ra mắt",
    system:     "Custom",
    urlPatterns: ["ueh.edu.vn", "dkmonhoc.ueh"],
    addedDate:  null
  },

  // ==================== ĐANG NGHIÊN CỨU ====================
  {
    shortName:  "HCMUT",
    fullName:   "ĐH Bách Khoa TP.HCM (HCMUT)",
    file:       null,
    status:     "research",
    statusLabel:"Đang nghiên cứu",
    system:     "Edusofts",
    urlPatterns: ["hcmut.edu.vn", "mybk.hcmut"],
    addedDate:  null
  },
  {
    shortName:  "UIT",
    fullName:   "ĐH Công nghệ Thông tin (UIT - VNU-HCM)",
    file:       null,
    status:     "research",
    statusLabel:"Đang nghiên cứu",
    system:     "Custom",
    urlPatterns: ["uit.edu.vn", "student.uit"],
    addedDate:  null
  }
];

// Xuất để dùng trong Node.js (nếu cần) hoặc browser global
if (typeof module !== "undefined" && module.exports) {
  module.exports = GUMBALLZ_ENGINES;
} else if (typeof window !== "undefined") {
  window.GUMBALLZ_ENGINES = GUMBALLZ_ENGINES;
}
