Here's a thorough breakdown based on what's documented across developer forums, bug trackers, and real-world QR scanner implementations:

---

## The Universal Rules (applies to ALL Android brands)

Before brand-specific stuff, these are non-negotiable regardless of device:

- **Must be HTTPS or localhost** — `applyConstraints({ torch })` silently fails or throws on plain HTTP
- **Torch only works on the rear camera track** — the flash LED is physically wired to the rear camera module only. A front-facing track will never have `torch: true` in capabilities
- **`getCapabilities()` must be called after the stream is live** — calling it immediately after `getUserMedia()` returns an empty object on most Android devices. You need to wait for the `playing` event + a delay
- **One camera track at a time** — if another app (or another tab) already holds the camera, the new stream won't have torch access
- **Firefox Android** — `applyConstraints({ torch })` has no effect. Torch only reliably works on Chrome for Android

---

## Brand-by-Brand Restrictions

### 🔵 Samsung (One UI)
The most problematic brand for this feature.

- **Multi-camera problem** — S-series (S21 onwards) and A-series mid-rangers expose 3–4 rear cameras as separate `videoinput` devices. Chrome picks one arbitrarily when you request `facingMode: environment`. Only the **main wide-angle lens** (`camera2 0, facing back` in the label) has torch capability. Ultrawide and telephoto tracks return no torch in capabilities and the constraint probe throws `NotSupportedError`
- **`facingMode: ideal` is unreliable** — it can resolve to any rear lens. You must enumerate `deviceId`s and iterate
- **Lazy capability population** — even on the correct camera, `getCapabilities()` can return `{}` for up to 500ms after the stream starts playing. Needs an explicit delay
- **One UI OS-level torch lock** — if you open the system quick-settings torch first, then open the camera, the camera track cannot control the torch (and vice versa). One UI treats them as competing users of the flash hardware
- **Samsung Internet browser** — does not expose `torch` at all via `getCapabilities()`. Chrome-only on Samsung

---

### 🟢 Google Pixel (stock Android / AOSP)
Best overall support.

- **Torch works reliably** on Chrome once the stream is on the rear camera
- **Multi-camera labels** are clean: `"camera2 0, facing back"` (wide), `"camera2 1, facing back"` (ultrawide), etc. Camera 0 always has torch
- **No OS-level torch lock** — Pixel's torch and camera share gracefully through the camera2 capture request
- **`getCapabilities()` populates quickly** — usually within one `loadedmetadata` event, no extra delay needed
- **Pixel 6+ caveat** — the Tensor chip occasionally drops the torch constraint silently on very first call. A retry after 200ms resolves it

---

### 🟡 Xiaomi / Redmi / POCO (MIUI / HyperOS)
Second most problematic after Samsung.

- **Camera2 API disabled on older MIUI** — on MIUI 9–11 (especially Redmi budget lines), `camera2.api.level` in `build.prop` was set to `LEGACY`, which breaks torch via `applyConstraints`. This is less common now on HyperOS but still seen on older Redmi devices
- **MIUI's aggressive battery optimization** kills camera streams in background tabs within seconds, which can torch-toggle the LED off unexpectedly
- **Multi-camera issue same as Samsung** — Xiaomi flags the ultrawide as `"camera2 1, facing back"` and it has no torch. Must use `deviceId` to target the main lens
- **HyperOS (MIUI 14+)** is much better — torch via web API works correctly on flagship Xiaomi 14/14 Ultra on Chrome
- **Mi Browser / built-in browser** — does not support `torch` constraint at all. Must use Chrome

---

### 🟠 OPPO / OnePlus / Realme (ColorOS / OxygenOS)
Moderate issues.

- **ColorOS restricts Camera2 advanced constraints** on some mid-range devices — `applyConstraints` with `torch` throws `OverconstrainedError` even when the physical torch works
- **OnePlus 3T had specific flash bugs** with Camera2 API that required the "alternative flash method" workaround (documented in Open Camera's changelog). Newer OnePlus devices running OxygenOS 13+ are fine
- **Realme UI** (which is ColorOS-derived) on budget Realme devices sometimes returns `torch: false` in capabilities even on the main camera. The constraint probe approach catches these cases
- **Multi-camera labeling** follows OPPO's own naming: `"back camera2 0"` etc. Same approach — enumerate and iterate by deviceId
- **ColorOS background restrictions** — ColorOS aggressively restricts camera resource usage for web apps. If the tab goes into the background, the torch turns off and cannot be re-enabled until the tab is foregrounded again

---

### ⚫ Nothing Phone (Nothing OS)
Closest to stock Android after Pixel.

- **Near-AOSP behaviour** — Nothing OS is built on AOSP with minimal camera customization, so torch via web API works reliably
- **Nothing Phone 1/2** only have dual rear cameras (main + ultrawide), so there are fewer wrong-camera pitfalls than Samsung S-series
- **Main camera label**: `"camera2 0, facing back"` — standard format
- **No known torch-specific restrictions** — performs similarly to Pixel in testing

---

### 🔴 Huawei / Honor (HarmonyOS / EMUI)
Largely broken for this use case.

- **No Google Chrome** on Huawei devices post-2020 (US sanctions). Default browser is Huawei Browser
- **Huawei Browser does not implement `torch` in `getCapabilities()`** — the property simply doesn't appear. `applyConstraints({ torch })` throws
- **Honor devices with Android + GMS** (sold outside China) and Chrome installed work normally — Honor has diverged from Huawei's restrictions

---

### 🟣 Vivo / iQOO (OriginOS / FuntouchOS)
Inconsistent.

- **OriginOS** (China market) has known Camera2 API gaps on some Vivo flagships — `torch` constraint is not advertised in capabilities even when physically present
- **FuntouchOS** (global) on Chrome is better but still has the multi-camera selection problem
- **iQOO** lines (which are gaming-oriented Vivos) generally work correctly on Chrome as they use less modified camera stacks

---

### 🟤 Motorola (stock-ish Android)
Generally reliable.

- **Close to stock Android** — Motorola's camera stack doesn't heavily customize Camera2 exposure
- **Moto G/Edge series** torch works correctly on Chrome via `applyConstraints`
- **Single rear flash module** on most Moto devices simplifies camera selection — usually only 1–2 rear `videoinput` entries

---

## Summary Table

| Brand | Chrome Torch Works | Main Gotcha |
|---|---|---|
| **Google Pixel** | ✅ Yes | Minor: retry on Tensor chips |
| **Nothing** | ✅ Yes | None notable |
| **Motorola** | ✅ Yes | None notable |
| **OnePlus** (new) | ✅ Usually | OxygenOS 13+ fine; older had flash bugs |
| **Samsung** | ⚠️ Only on main camera | Must enumerate by `deviceId`; lazy caps |
| **Xiaomi/Redmi** | ⚠️ Mostly | HyperOS fine; old MIUI Camera2 LEGACY |
| **OPPO/Realme** | ⚠️ Mostly | Mid-rangers: constraint probe needed |
| **Vivo/iQOO** | ⚠️ Inconsistent | OriginOS gaps; multi-camera selection |
| **Huawei** | ❌ No | No Chrome; Huawei Browser unsupported |
| **iOS (all brands)** | ❌ No | WebKit doesn't expose torch |

---

## The Practical Defensive Strategy

Given all of the above, the most resilient approach for your QR scanner is:

1. **Always enumerate + iterate `deviceId`s** — don't rely on `facingMode: environment` alone
2. **Sort cameras preferring label containing `"0,"` and `"back"`** — catches Samsung and AOSP naming
3. **Wait 400–500ms after `playing` event** before calling `getCapabilities()` — covers Samsung and Xiaomi lazy init
4. **Use both detection methods** — `getCapabilities().torch` first, constraint probe as fallback
5. **Gracefully degrade** — if no torch-capable track is found, keep the camera open for QR scanning and just hide the torch button. Don't block the core feature