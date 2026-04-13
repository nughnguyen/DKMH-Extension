export class SessionKeeper {
    constructor() {
        this.interval = 5 * 60 * 1000; // 5 minutes
    }

    startHeartbeat(engineId) {
        console.log(`[SessionKeeper] Starting heartbeat for ${engineId}`);
        chrome.alarms.create(`session_keeper_${engineId}`, { periodInMinutes: 5 });
    }

    ping(engineName) {
        console.log(`[SessionKeeper] ${engineName} pinging server to keep session alive...`);
        // Actual fetch/XHR to a harmless endpoint on the school server
    }
}
