# Packages
```shell
npm install html5-qrcode
```
---

# Import via Module Loader
```js
import { Html5Qrcode } from "html5-qrcode";
```

# 1. HTML structure in map.html

```html
<div id="qrcode_scanner"></div>

<button id="qr-flash-btn">Toggle Flash</button>
```

# HTML5-qrcode [ QR Code Scanning ]
```js
const html5QrCode = new Html5Qrcode("reader");
const qrCodeSuccessCallback = (decodedText, decodedResult) => {
    /* handle success */
};
const config = { fps: 60};
 
// If you want to prefer back camera
html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);

// Select back camera or fail with `OverconstrainedError`.
html5QrCode.start({ facingMode: { exact: "environment"} }, config, qrCodeSuccessCallback);
// If a back facing camera is not discoverable, prompt the user to switch to text input mode
// Add in a line below the flash button to provide the above prompt
```

# HTML5-qrcode [ Toggle Torch ]
```js
// Init scanner.
const scanner = new Html5Qrcode(...);
await scanner.start(...)

// Toggle flashlight.
const torch = scanner.getRunningTrackCameraCapabilities().torchFeature();
torch.apply(!torch.value()); // activate this when the button with id="qr-flash-btn is activated
```

# Flow of events
1. The user clicks on the qr code scanning button
2. The qr code scanner is started
3. The user scans the qr code
4. The qr code result is processed
    a. the string will be something like "https://...?qrID=<id>"
    b. the id is extracted from the string
    c. stop the scanner to kill the camera feed in the view finder
    d. set the url param for qrID as the string and activate the redirect
5. The user is redirected to the qr code destination

---

# Take note
- If the user clicks on the text input option, the qrcode scanning function should be toggled off.
- If the user clicks on the text input option, the torch should toggle off if it was on previously
- If the user exits the pop up, the feed should be stopped, torch should be toggle off and any input in the text input fields should be cleared
- If the user clicks on the qrcode option, any input in the text input fields should be cleared and the qrcode scanner shld be started