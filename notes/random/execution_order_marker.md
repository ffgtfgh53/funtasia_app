````markdown id="9x3k2p"
# Minimal QR ID Handling (Event-Based, Lazy Loading Safe)

## Goal
- Extract `qrID` from URL
- Wait for `modelReady`
- Pass `qrID` into your existing marker dictionary logic

---

## Step 1 — Get qrID from URL

```js
const params = new URLSearchParams(window.location.search);
const qrID = params.get("qrID"); // change key if needed
````

---

## Step 2 — Handle After Model Ready

```js
window.addEventListener("modelReady", () => {
  if (!qrID) return;

  // call your existing handler
  processQR(qrID);
});
```

---

## Step 3 — Your Processing Hook

```js
function processQR(qrID) {
  // your global dictionary logic here
  // e.g. markers[qrID]
}
```

---

## Optional (if event might fire before listener)

```js
if (window.modelReady) {
  processQR(qrID);
} else {
  window.addEventListener("modelReady", () => {
    processQR(qrID);
  });
}
```

---

## Expected Flow

1. Page loads → `qrID` extracted
2. Model loads → `modelReady` fires
3. `processQR(qrID)` runs safely

---

## Result

* No race condition
* No unnecessary complexity
* Works cleanly with lazy loading

```
```
