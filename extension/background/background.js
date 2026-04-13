import { EiuEngine } from '../prod/implementation/eiu_engine.js';
import { TdmuEngine } from '../prod/implementation/tdmu_engine.js';

const engines = {
    'eiu': new EiuEngine(),
    'tdmu': new TdmuEngine()
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'START_REGISTRATION') {
        const { engineId, url, subjectCode, options } = request.payload;
        
        const engine = engines[engineId];
        if (engine) {
            console.log(`[Background] Starting engine: ${engineId}`);
            engine.execute(url, subjectCode, options);
            sendResponse({ status: 'started' });
        } else {
            console.error(`[Background] Engine not found: ${engineId}`);
            sendResponse({ status: 'error', message: 'Engine not found' });
        }
    }
    return true;
});

// Setup alarm for Session Keeper (Heartbeat)
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith('session_keeper_')) {
        const engineId = alarm.name.replace('session_keeper_', '');
        if (engines[engineId]) {
            engines[engineId].ping();
        }
    }
});
