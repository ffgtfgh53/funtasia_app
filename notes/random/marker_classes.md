# Marker Classes — Summary

> **Files:** `src/js/marker/marker.js` · `src/js/marker/qrmarker.js` · `src/js/marker/icon.js`

---

## Class Hierarchy

```
Marker                  (marker.js)
├── LocationMarker      (marker.js)
│   ├── QRMarker        (qrmarker.js)
│   └── DirectoryMarker (directorymarker.js)
└── Icon                (icon.js)
```

---

## `Marker` — `marker.js`

Base class for all marker types. Handles scene attachment and root group setup.

### Static Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `appState` | `any \| null` | `null` | Global app state; set externally before instantiation. |
| `scene` | `THREE.Scene \| null` | `null` | The Three.js scene; set externally before instantiation. |
| `font` | `any \| null` | `null` | Font reference (declared here, overridden in `LocationMarker`). |

### Instance Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `appState` | `any` | Local copy resolved from `Marker.appState`. |
| `scene` | `THREE.Scene` | Resolved from `Marker.scene` or `appState.scene`. |
| `position` | `THREE.Vector3` | Cloned world position, defaults to `(0, 0, 0)`. |
| `level` | `any` | The floor/level the marker belongs to. |
| `group` | `THREE.Group` | Root Three.js group, positioned and added to the scene. |
| `indicator` | `THREE.Object3D \| null` | Visual indicator object; to be populated by subclasses. |

### Methods

| Method | Description |
|--------|-------------|
| `constructor(position, level)` | Creates the group, positions it, and adds it to the scene. |
| `clear()` | Removes the group from the scene and nullifies it. Subclasses are responsible for disposing geometries/materials of `this.indicator`. |

---

## `LocationMarker extends Marker` — `marker.js`

Displays a 3D Google Maps–style pin (loaded from a `.glb` file) with an optional "You are here!" text label. Handles floating animation and camera billboarding each frame.

### Static Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `font` | `THREE.Font \| null` | `null` | Font used to render the text label. Must be set before instantiation if `text=true`. |

### Instance Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `scene` | `THREE.Scene` | Reference to the scene (supplied via constructor). |
| `markerHeight` | `number` | Resting Y-offset of the GLB model (`0.8`). |
| `group` | `THREE.Group` | Root group containing the ring, model, and optional label. |
| `_markerModel` | `THREE.Object3D \| null` | Loaded GLB scene; `null` until the async `GLTFLoader` callback fires. |
| `_textLabelGroup` | `THREE.Group \| null` | Group holding the text mesh and its background plane; `null` if `text=false` or font is not set. |

> **Materials** (created inline in the constructor, not stored as named instance attributes):
> - `activeMaterial` — `MeshBasicMaterial` red (`0xff0000`), applied to the ring and all model meshes.
> - `outlineMaterialActive` — `LineBasicMaterial` dark red (`0x550000`), used for edge outlines.
> - `textMaterialActive` — `MeshBasicMaterial` red, semi-transparent, `DoubleSide`.
> - `textBgMaterial` — `MeshBasicMaterial` white, semi-transparent, `DoubleSide`.

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `constructor` | `(scene, position, text = false)` | Builds the flat ring geometry, asynchronously loads the GLB pin model (applying red materials and edge outlines to each mesh), and optionally creates the billboarded "You are here!" text label centred above the pin. |
| `animate` | `(time, camera)` | Per-frame update: bobs `_markerModel` vertically with `Math.sin`, points it horizontally toward the camera (`lookAt`), and billboards `_textLabelGroup` by copying `camera.quaternion`. |

---

## `QRMarker extends LocationMarker` — `qrmarker.js`

A `LocationMarker` variant that always shows the text label and automatically "greys out" (replaces all materials with a grey palette) after a configurable delay.

### Static Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `appState` | `any \| null` | `null` | Global app state; set externally (e.g. in `main.js`). |

### Instance Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `greyMaterial` | `THREE.MeshBasicMaterial` | Grey mesh material (`0x777777`), applied to all meshes on grey-out. |
| `outlineMaterialGrey` | `THREE.LineBasicMaterial \| null` | Dark grey line material (`0x333333`); created lazily inside `greyOut()`. |
| `startTime` | `number` | `performance.now()` value captured at construction. |
| `greyDelay` | `number` | Milliseconds to wait before greying out (default `300000` — 5 minutes). |
| `isGrey` | `boolean` | `true` once `greyOut()` has been applied. |
| `markerHeight` | `number` | Overrides parent; set to `0.8`. |

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `constructor` | `(scene, position, greyDelay = 5 * 60000)` | Calls `super(scene, position, true)` to always enable the text label, then initialises grey-out state and materials. |
| `animate` | `(time, camera)` | Manually replicates floating-bob and billboarding by looking up named children (`"markerModel"`, `"textLabelGroup"`) with `getObjectByName`, then delegates to `super.animate()`. After the delay has elapsed, calls `greyOut()`. |
| `greyOut` | `()` | Traverses `this.group` and replaces all mesh and line materials with the grey variants. Removes `_textLabelGroup` from the group and sets `isGrey = true`. |
| `clear` | `()` | Removes the group from the scene, traverses and disposes all geometries/materials, disposes `greyMaterial` and `outlineMaterialGrey`, and nullifies `this.group`. |

> **Note:** `QRMarker.animate()` partially duplicates floating/billboarding logic from `LocationMarker.animate()` — it uses named child lookups before calling `super.animate()`, while the parent operates on `this._markerModel` and `this._textLabelGroup` directly. These two code paths may diverge if the parent is updated.

---

## `Icon extends Marker` — `icon.js`

Renders a billboarding sprite (PNG texture) for facility icons such as lifts, stairs, and toilets. Supports per-level visibility control and distance-based dynamic scaling.

### Static Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `iconPaths` | `Object<string, string>` | See below | Maps icon type keys to PNG asset URLs. |
| `iconsVisible` | `boolean` | `true` | Global visibility toggle for all icons. |
| `activeLevel` | `any \| null` | `null` | Currently active floor level; only matching icons are shown. |
| `iconsByLevel` | `Object<string, Icon[]>` | `{}` | Registry mapping level IDs to arrays of `Icon` instances for efficient batch visibility updates. |

**`iconPaths` keys:** `lift`, `stair-u`, `stair-d`, `stair-ud`, `mtoilet`, `ftoilet`, `atoilet`

### Instance Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `icontype` | `string` | The icon type key (e.g. `'lift'`). |
| `iconPath` | `string` | Resolved PNG file path from `Icon.iconPaths[type]`. |
| `material` | `THREE.SpriteMaterial` | Sprite material with loaded PNG texture; transparency and depth testing enabled. |
| `indicator` | `THREE.Sprite` | The billboarding sprite object, elevated `0.5` units above the floor. |
| `baseScale` | `number` | Base scale of the sprite (`0.8`); used as the upper cap in distance-based scaling. |

### Methods

| Method | Kind | Signature | Description |
|--------|------|-----------|-------------|
| `constructor` | Instance | `(type, position, level)` | Loads the PNG texture (SRGB colour space, mipmaps, anisotropic filtering ×16), creates a `SpriteMaterial` and `Sprite`, registers the instance in `Icon.iconsByLevel`, and applies current global visibility. |
| `state` | Static | `(isVisible: boolean)` | Sets `Icon.iconsVisible` and calls `updateVisibility()`. |
| `setLevel` | Static | `(levelId: any)` | Sets `Icon.activeLevel` and calls `updateVisibility()`. |
| `updateVisibility` | Static | `()` | Iterates over `iconsByLevel` and sets each icon group's `visible` flag to `iconsVisible && level === activeLevel`. |
| `animate` | Instance | `(time, camera)` | Computes camera-to-sprite distance; scales the sprite as `distance × 0.08`, capped at `baseScale`. Hides if scale falls below `baseScale / 4.5` or if `iconsVisible` / `activeLevel` conditions are not met. |
| `clear` | Instance | `()` | Calls `super.clear()` (removes group from scene), disposes the texture and material, and removes the instance from `Icon.iconsByLevel`. |

---

## `DirectoryMarker extends LocationMarker` — `directorymarker.js`

A lightweight `LocationMarker` variant used for directory/wayfinding pins. No text label is shown. Provides its own `animate()` that bobs the model and horizontally billboards it toward the camera.

### Static Attributes

None defined — inherits `LocationMarker.font` from the parent.

### Instance Attributes

No additional instance attributes beyond those inherited from `LocationMarker`.

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `constructor` | `(position, level)` | Calls `super(position, level, false)` — `false` disables the text label. No extra setup. |
| `animate` | `(time, camera)` | Looks up the model child by name (`getObjectByName("markerModel")`), applies a vertical sine-wave bob (`y = 0.8 + sin(t × 0.5) × 0.05`), then performs a horizontal `lookAt` toward the camera (locking `targetPos.y` to the model's own Y to avoid vertical tilt). Does **not** call `super.animate()`. |

> **Note:** Like `QRMarker`, `DirectoryMarker` duplicates the floating-bob and look-at logic from `LocationMarker.animate()` using `getObjectByName("markerModel")` instead of the parent's `this._markerModel` reference. Notably, it does **not** handle billboarding of a text label (since `text=false`), and it skips calling `super.animate()`.
