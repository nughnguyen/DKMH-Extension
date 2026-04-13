// Content script running in the context of the page
console.log("[GumballZ] Polling script injected.");

// Simulate polling memory
let isPolling = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'PING_POLLING') {
        sendResponse({ status: 'active', isPolling });
    }
});
