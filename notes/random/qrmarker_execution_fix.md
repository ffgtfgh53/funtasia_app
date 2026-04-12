# Implementation Plan — Immediate QR ID Handling

## Problem

When the page loads with a `?qrID=...` URL, the current flow in `main.js` calls `handleURLQR()` → `Navigation.handleQRID()` immediately. However, `QRMarker.allMarkers` is only populated **after** the target floor's model is fetched and parsed by `parseModel()` (which happens inside `Navigation.switchFloor()`). So `handleQRID` always finds an empty registry and returns `false`.

**Current broken flow:**
```
initApp()
  → handleURLQR()               ← qrID extracted from URL
    → Navigation.handleQRID()   ← QRMarker.allMarkers is still {}
      → not found → shows toast and falls through to default floor
```

---

## Proposed Fix

Following the pattern from `execution_order_marker.md`: fire a custom event **after parsing**, and defer the `handleQRID` call until that event arrives.

### The Event: `floorReady`

- Dispatched on `window` after `Floor.load()` completes (i.e. after `parseModel` runs and markers are registered).
- Carries `detail.floorId` so listeners can check whether the loaded floor is the one they care about.
- Idempotent — listening only once per load.

---

## Proposed Changes

---

### [floor.js](file:///c:/Users/goofy/Documents/School/Non%20Academics/Funtasia/funtasia_app/src/js/floor/floor.js)

#### [MODIFY] `load()` method

After `this.attachParsedData(...)`, dispatch the `floorReady` event:

```js
window.dispatchEvent(new CustomEvent("floorReady", { detail: { floorId: this.id } }));
```

This is the only change to `floor.js`. Existing `attachParsedData`, `activate`, `hide`, etc. are untouched.

---

### [navigation.js](file:///c:/Users/goofy/Documents\School\Non Academics\Funtasia\funtasia_app\src\js\base\navigation.js)

#### [MODIFY] `handleURLQR()` — the **only** function changed

Replace the logic that immediately calls `handleQRID` with a two-branch approach:

1. **If a `qrID` is in the URL**, extract it and check `QRMarker.allMarkers` right away (covers the case where the floor was already loaded, e.g. `popstate` events after the first load).
   - If found → call `handleQRID(qrID)` immediately as before.
   - If **not found yet** → register a one-shot `floorReady` listener that defers the `handleQRID` call. Then still call `switchFloor` so the floor begins loading.

2. **No `qrID`** → behaves identically to today (just calls `switchFloor("l1")`).

Existing functions `handleQRID` and `switchFloor` are **not modified at all**.

**Pseudocode for the updated `handleURLQR`:**

```js
static handleURLQR() {
  const urlParams = new URLSearchParams(window.location.search);
  const qrID = urlParams.get("qrID");

  if (qrID) {
    console.log(`URL/Popstate qrID: ${qrID}`);

    // Try immediately — works if floor already loaded (e.g. popstate)
    const handled = Navigation.handleQRID(qrID);
    if (handled) return;

    // Not ready yet — defer until the right floor finishes loading
    const onFloorReady = (e) => {
      if (Navigation.handleQRID(qrID)) {
        window.removeEventListener("floorReady", onFloorReady);
      }
    };
    window.addEventListener("floorReady", onFloorReady);

    // Still kick off the floor load (so the event fires)
    const markerInfo = QRMarker.allMarkers[qrID]; // still empty, but...
    const targetFloorId = markerInfo?.floorId ?? "l1";
    Navigation.switchFloor(targetFloorId);
    return;
  }

  Navigation.switchFloor("l1");
}
```

> **Note on `targetFloorId`:** The first 2 characters of the `qrID` encode the floor — e.g. `"l1-m4-linkway"` → `"l1"`, `"b2-entrance"` → `"b2"`. This matches the keys in `Floor.floors` directly. So we can reliably derive the correct floor to load with `qrID.slice(0, 2)`, and pass that to `switchFloor`. No guessing or hardcoded `"l1"` default needed.

---

**Updated pseudocode for the `qrID` branch:**

```js
if (qrID) {
  const handled = Navigation.handleQRID(qrID);
  if (handled) return;

  // Derive target floor from first 2 chars of qrID (e.g. "l1-...", "b2-...")
  const targetFloorId = qrID.slice(0, 2);

  const onFloorReady = (e) => {
    if (Navigation.handleQRID(qrID)) {
      window.removeEventListener("floorReady", onFloorReady);
    }
  };
  window.addEventListener("floorReady", onFloorReady);

  Navigation.switchFloor(targetFloorId);  // loads correct floor directly
  return;
}
```

---

## What Is NOT Changed

- `Navigation.handleQRID()` — no changes
- `Navigation.switchFloor()` — no changes
- `Navigation.init()` — no changes
- `main.js` — no changes
- `QRMarker`, `Floor`, `appState`, `animate.js` — no changes

---

## Expected Flow After Fix

```
initApp()
  → handleURLQR()
    → handleQRID(qrID) → false (allMarkers still empty)
    → addEventListener("floorReady", onFloorReady)   ← deferred
    → switchFloor("l1")
        → Floor.load()
            → parseModel() → populates QRMarker.allMarkers
            → attachParsedData()
            → dispatchEvent("floorReady")            ← fires here
              → onFloorReady()
                → handleQRID(qrID) → true ✓
                  → QRMarker placed, camera animated
```

---

## Verification Plan

### Manual
- Load app with `?qrID=l1-m4-linkway` (or a known valid ID)
- Verify the floor loads, the QR marker appears, and camera animates to it
- Verify no "Marker not found" toast appears
- Verify `window.printAllMarkers()` shows the correct entries in console after load

### Edge Cases
- `?qrID=<unknown-id>` → toast "Marker not found" (unchanged behaviour via `handleQRID` returning false)
- No `?qrID` in URL → default `l1` loads as before (unchanged)
- `popstate` event after initial load → `allMarkers` already populated, `handleQRID` succeeds on first try, no listener registered
