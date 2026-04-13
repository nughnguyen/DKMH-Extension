export class TelegramNotify {
    static async send(botToken, chatId, message) {
        console.log(`[TelegramNotify] Sending notification to ${chatId}`);
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        // try {
        //     await fetch(url, {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({ chat_id: chatId, text: message })
        //     });
        // } catch (e) {
        //     console.error('[TelegramNotify] Failed to send message', e);
        // }
    }
}
