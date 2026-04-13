document.addEventListener('DOMContentLoaded', () => {
    const targetUrlInput = document.getElementById('targetUrl');
    const subjectCodeInput = document.getElementById('subjectCode');
    const detectionResult = document.getElementById('detectionResult');
    const btnStart = document.getElementById('btnStart');
    const engineStatus = document.getElementById('engineStatus');
    
    // Known engines
    const engines = [
        { id: 'eiu', domains: ['eiu.edu.vn'], name: 'Eastern International University (EIU)' },
        { id: 'tdmu', domains: ['tdmu.edu.vn'], name: 'Thu Dau Mot University (TDMU)' }
    ];

    let currentEngine = null;

    targetUrlInput.addEventListener('input', (e) => {
        const url = e.target.value.toLowerCase();
        
        currentEngine = engines.find(eng => eng.domains.some(domain => url.includes(domain)));

        if (currentEngine) {
            detectionResult.textContent = `Đã nhận diện: ${currentEngine.name}`;
            detectionResult.style.color = '#2ed573';
        } else if (url.length > 5) {
            detectionResult.textContent = "Trường học này hiện đang được GumballZ Team nghiên cứu phát triển";
            detectionResult.style.color = '#ff4757';
        } else {
            detectionResult.textContent = "Chưa nhận diện trường...";
            detectionResult.style.color = '#ffeb3b';
        }
    });

    btnStart.addEventListener('click', () => {
        const url = targetUrlInput.value.trim();
        const code = subjectCodeInput.value.trim();
        
        if (!url || !code) {
            alert('Vui lòng nhập Link và Mã Môn Học!');
            return;
        }

        if (!currentEngine) {
            alert('Chưa cấu hình Engine cho trường này. Vui lòng tham gia phát triển!');
            return;
        }

        const stealth = document.getElementById('stealthMode').checked;
        const autoLogin = document.getElementById('autoLogin').checked;

        engineStatus.innerHTML = '<span class="dot green"></span> Running';
        btnStart.textContent = 'Đang Xử Lý...';
        btnStart.style.opacity = '0.7';
        btnStart.disabled = true;

        chrome.runtime.sendMessage({
            action: 'START_REGISTRATION',
            payload: {
                engineId: currentEngine.id,
                url: url,
                subjectCode: code,
                options: { stealth, autoLogin }
            }
        });
    });

    document.getElementById('openPortal').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: chrome.runtime.getURL('../web-portal/index.html') }); // Note this won't work perfectly if web-portal isn't accessible, usually it's hosted or bundled.
        // Actually, we'll assume the web-portal is hosted externally later. For now, open github.
        chrome.tabs.create({ url: "https://github.com/nughnguyen/DKMH-Extension.git" });
    });
});
