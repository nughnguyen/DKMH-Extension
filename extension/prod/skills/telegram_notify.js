/**
 * GumballZ - Telegram Notify (Skill)
 * Gui thong bao den nguoi dung qua Telegram Bot
 * Tac gia: Nguyen Quoc Hung - EIU Student
 */

"use strict";

window.__gumballz_telegram = {

  /**
   * Lay cau hinh Telegram tu storage
   */
  async _getConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get("gumballz_settings", ({ gumballz_settings }) => {
        resolve({
          botToken: gumballz_settings?.telegramBotToken || null,
          chatId:   gumballz_settings?.telegramChatId   || null
        });
      });
    });
  },

  /**
   * Gui tin nhan van ban
   * @param {string} message - Noi dung tin nhan (ho tro Markdown)
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  async send(message) {
    const { botToken, chatId } = await this._getConfig();

    if (!botToken || !chatId) {
      console.log("[GumballZ] Telegram chua duoc cau hinh. Bo qua notify.");
      return { ok: false, error: "Chua cau hinh Telegram" };
    }

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            chat_id:    chatId,
            text:       message,
            parse_mode: "Markdown"
          })
        }
      );

      const data = await response.json();

      if (data.ok) {
        console.log("[GumballZ] Telegram: Tin nhan da duoc gui.");
        return { ok: true };
      } else {
        console.warn("[GumballZ] Telegram loi:", data.description);
        return { ok: false, error: data.description };
      }
    } catch (err) {
      console.error("[GumballZ] Telegram request that bai:", err.message);
      return { ok: false, error: err.message };
    }
  },

  /**
   * Noi dung tin nhan mau - Dang ky thanh cong
   */
  successMessage(courseCode, schoolName) {
    return `*GumballZ* - Dang ky thanh cong\n\n` +
           `Mon hoc: \`${courseCode}\`\n` +
           `Truong: ${schoolName}\n` +
           `Thoi gian: ${new Date().toLocaleString("vi-VN")}\n\n` +
           `_GumballZ by Nguyen Quoc Hung - EIU_`;
  },

  /**
   * Noi dung tin nhan mau - Dang ky that bai
   */
  failedMessage(courseCode, reason) {
    return `*GumballZ* - Dang ky that bai\n\n` +
           `Mon hoc: \`${courseCode}\`\n` +
           `Ly do: ${reason}\n` +
           `Thoi gian: ${new Date().toLocaleString("vi-VN")}\n\n` +
           `_Vui long thu lai thu cong._`;
  },

  /**
   * Kiem tra Bot Token va Chat ID hop le
   * @param {string} botToken
   * @param {string} chatId
   * @returns {Promise<{ok: boolean, botName?: string, error?: string}>}
   */
  async test(botToken, chatId) {
    try {
      // Kiem tra bot ton tai
      const meResp = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const meData = await meResp.json();
      if (!meData.ok) return { ok: false, error: "Bot Token khong hop le" };

      // Gui tin nhan test
      const sendResp = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            chat_id: chatId,
            text:    "GumballZ - Ket noi Telegram thanh cong! Bot dang hoat dong binh thuong."
          })
        }
      );
      const sendData = await sendResp.json();

      if (sendData.ok) {
        return { ok: true, botName: meData.result.first_name };
      }
      return { ok: false, error: sendData.description };

    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
};
