import { BaseEngine } from './base_engine.js';

export class EiuEngine extends BaseEngine {
    constructor() {
        super('eiu', 'Eastern International University (EIU)');
    }

    handleAutoLogin() {
        console.log(`[${this.engineName}] Injecting auto-login script for EIU portal...`);
        // Simulate auto-login injection
        // chrome.scripting.executeScript(...)
    }

    async execute(url, subjectCode, options) {
        console.log(`[${this.engineName}] Starting custom EIU routine.`);
        await super.execute(url, subjectCode, options);
        // EIU specific form submission handling could go here.
    }
}
