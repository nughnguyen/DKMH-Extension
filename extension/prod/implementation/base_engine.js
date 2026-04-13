import { SessionKeeper } from '../skills/session-keeper.js';
import { RegistrationTask } from '../tasks/registration.js';

export class BaseEngine {
    constructor(engineId, engineName) {
        this.engineId = engineId;
        this.engineName = engineName;
        this.sessionKeeper = new SessionKeeper();
        this.registrationTask = new RegistrationTask();
    }

    async execute(url, subjectCode, options) {
        console.log(`[${this.engineName}] Executing task for ${subjectCode} at ${url}`);
        
        if (options.autoLogin) {
            this.handleAutoLogin();
        }

        // Delay logic for stealth
        if (options.stealth) {
            await this.humanDelay(1500, 3000);
        }

        this.registrationTask.start(url, subjectCode);
    }

    ping() {
        this.sessionKeeper.ping(this.engineName);
    }

    handleAutoLogin() {
        console.warn(`[${this.engineName}] Auto-login is not implemented in BaseEngine.`);
    }

    humanDelay(minMs, maxMs) {
        const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
