import { Html5Qrcode } from "html5-qrcode";

let html5QrCode = null;

export async function startScanner(successCallback) {
    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("qrcode_scanner");
    }
    
    if (html5QrCode.isScanning) {
        return;
    }
    
    // As per markdown notes
    const config = { fps: 60 };
    
    try {
        await html5QrCode.start(
            { facingMode: "environment" }, 
            config, 
            (decodedText, decodedResult) => {
                successCallback(decodedText, decodedResult);
            }
        );
        // Clear any previous error messages if started successfully
        const errorMsg = document.getElementById('qr-error-msg');
        if (errorMsg) errorMsg.remove();
    } catch (err) {
        console.error("Failed to start QR scanner:", err);
        // Prompt user to switch to text input mode
        const scannerView = document.getElementById('qr-scanner-view');
        let errorMsg = document.getElementById('qr-error-msg');
        if (!errorMsg) {
            errorMsg = document.createElement('p');
            errorMsg.id = 'qr-error-msg';
            errorMsg.style.color = '#ff6b6b';
            errorMsg.style.fontSize = '12px';
            errorMsg.style.marginTop = '12px';
            errorMsg.style.textAlign = 'center';
            errorMsg.style.fontFamily = "'JetBrains Mono', monospace";
            // Insert it under the flash button
            const flashBtn = document.getElementById('qr-flash-btn');
            if (flashBtn && flashBtn.parentNode) {
                flashBtn.parentNode.insertBefore(errorMsg, flashBtn.nextSibling);
            } else if (scannerView) {
                scannerView.appendChild(errorMsg);
            }
        }
        errorMsg.textContent = "Camera not discoverable. Please use text input mode.";
    }
}

export async function stopScanner() {
    if (html5QrCode && html5QrCode.isScanning) {
        try {
            await html5QrCode.stop();
            html5QrCode.clear(); 
        } catch (err) {
            console.error("Failed to stop QR scanner:", err);
        }
    }
    
    // Automatically reset torch UI when stopping scanner
    const qrFlashBtn = document.getElementById('qr-flash-btn');
    const qrFlashIcon = document.getElementById('qr-flash-icon');
    if (qrFlashBtn && qrFlashIcon) {
        qrFlashIcon.textContent = 'flashlight_off';
        qrFlashBtn.style.background = 'color-mix(in srgb, var(--color-primary) 15%, transparent)';
    }

    // Attempt to restore placeholder if it was cleared
    const scannerDiv = document.getElementById('qrcode_scanner');
    if (scannerDiv && !scannerDiv.innerHTML.includes('qr_code_scanner')) {
        scannerDiv.innerHTML = '<span class="material-symbols-outlined" style="font-size: 48px; color: var(--color-on-surface-variant); opacity: 0.4;">qr_code_scanner</span>';
    }
}

export async function toggleTorch(buttonElement, iconElement) {
    if (!html5QrCode || !html5QrCode.isScanning) {
        console.warn("Scanner is not running. Cannot toggle torch.");
        return;
    }

    try {
        const capabilities = html5QrCode.getRunningTrackCameraCapabilities();
        const torch = capabilities.torchFeature();
        
        const newValue = !torch.value();
        await torch.apply(newValue);

        if (newValue) {
            iconElement.textContent = 'flashlight_on';
            buttonElement.style.background = 'color-mix(in srgb, var(--color-primary) 30%, transparent)';
        } else {
            iconElement.textContent = 'flashlight_off';
            buttonElement.style.background = 'color-mix(in srgb, var(--color-primary) 15%, transparent)';
        }
    } catch (err) {
        console.error("Failed to toggle torch:", err);
    }
}
