import { BaseEngine } from './base_engine.js';

export class TdmuEngine extends BaseEngine {
    constructor() {
        super('tdmu', 'Thu Dau Mot University (TDMU)');
    }

    handleAutoLogin() {
        console.log(`[${this.engineName}] Injecting auto-login script for TDMU portal...`);
        // Simulate auto-login injection
        // chrome.scripting.executeScript(...)
    }

    async execute(url, subjectCode, options) {
        console.log(`[${this.engineName}] Starting custom TDMU routine.`);
        await super.execute(url, subjectCode, options);
    }
}
