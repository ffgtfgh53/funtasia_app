# Marker Class Hierarchy

> **Files:** `src/js/marker/marker.js` · `src/js/marker/icon.js` · `src/js/marker/qrmarker.js`

---

## Class Hierarchy

```
Marker  (marker.js)
└── LocationMarker  (marker.js)

Icon  (icon.js)          — standalone, no inheritance

QRMarker  (qrmarker.js)  — standalone, no inheritance

createMarkerGroup()      — utility function (marker.js)
```

> **Note:** `Marker` and `LocationMarker` are currently barebone stubs. The active implementations are `Icon`, `QRMarker`, and the `createMarkerGroup()` utility.

---

## `Marker` — `marker.js`

Base class. Currently a barebone stub with no attributes or methods defined.

| Kind | Name | Description |
|------|------|-------------|
| Constructor | `constructor()` | Empty — barebone structure only |

---

## `LocationMarker extends Marker` — `marker.js`

Extends `Marker`. Also a barebone stub.

| Kind | Name | Description |
|------|------|-------------|
| Constructor | `constructor()` | Calls `super()` — barebone structure only |

---

## `createMarkerGroup()` — `marker.js`

A standalone utility function (not a class) that builds and returns a `THREE.Group` containing a GLB model, a ring, and an optional text label.

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `font` | `THREE.Font` | — | Font used to render the text label |
| `text` | `boolean` | `false` | Whether to include the "You are here!" text label |

### Internal Locals (created inside function)

| Variable | Type | Description |
|----------|------|-------------|
| `group` | `THREE.Group` | Root group returned to caller |
| `markerHeight` | `number` | Y-offset for the 3D model (`0.8`) |
| `activeMaterial` | `THREE.MeshBasicMaterial` | Red fill material (`0xff0000`) |
| `outlineMaterialActive` | `THREE.LineBasicMaterial` | Dark red outline (`0x550000`) |
| `ring` | `THREE.Mesh` | Flat ring geometry on the floor |
| `ringOutline` | `THREE.LineSegments` | Edge outline on the ring |
| `loader` | `GLTFLoader` | Loads `google-map-icon.glb` |
| `textLabelGroup` | `THREE.Group` | Group holding text + background mesh |
| `textMesh` | `THREE.Mesh` | "You are here!" text mesh |
| `textBgMesh` | `THREE.Mesh` | White padded background for text |

### Returns

`THREE.Group` — the assembled marker group.

---

## `Icon` — `icon.js`

Standalone class. Renders a billboard sprite icon (PNG) in the 3D scene, always facing the camera. Manages all instances statically.

### Static Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `Icon.appState` | `object \| null` | `null` | Reference to global app state (set in `main.js`) |
| `Icon.iconPaths` | `object` | See below | Maps icon type keys to asset PNG URLs |
| `Icon.iconsVisible` | `boolean` | `true` | Global visibility toggle for all icons |
| `Icon.activeLevel` | `string \| null` | `null` | Currently active floor level ID |
| `Icon.allIcons` | `Icon[]` | `[]` | Registry of all living `Icon` instances |
| `Icon.scene` | `THREE.Scene \| null` | `null` | Static scene reference |

**`Icon.iconPaths` keys:** `lift`, `stair-u`, `stair-d`, `stair-ud`, `mtoilet`, `ftoilet`, `atoilet`

### Instance Attributes (set in constructor)

| Attribute | Type | Description |
|-----------|------|-------------|
| `this.icontype` | `string` | Icon type key (e.g. `'lift'`) |
| `this.iconPath` | `string` | Resolved URL for the icon PNG |
| `this.position` | `THREE.Vector3` | Cloned world position |
| `this.level` | `string` | Floor level this icon belongs to |
| `this.group` | `THREE.Group` | Root group added to scene |
| `this.material` | `THREE.SpriteMaterial` | Sprite material with loaded texture |
| `this.sprite` | `THREE.Sprite` | The billboard sprite object |
| `this.baseScale` | `number` | Base sprite scale (`0.8`) |

### Constructor

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `string` | Icon type key matching `Icon.iconPaths` |
| `position` | `THREE.Vector3` | World position for the icon |
| `level` | `string` | Floor level ID |

### Methods

| Method | Kind | Parameters | Description |
|--------|------|------------|-------------|
| `static state(isVisible)` | Static | `isVisible: boolean` | Sets global visibility for all icons and triggers update |
| `static setLevel(levelId)` | Static | `levelId: string` | Sets the active level and triggers visibility update |
| `static updateVisibility()` | Static | — | Iterates `allIcons` and applies visibility based on `iconsVisible` and `activeLevel` |
| `animate(time, camera)` | Instance | `time: number`, `camera: THREE.Camera` | Scales sprite based on camera distance; hides if too close |
| `clear()` | Instance | — | Removes group from scene, disposes material/texture, removes from `allIcons` registry |

---

## `QRMarker` — `qrmarker.js`

Standalone class. Renders a full-featured location marker (GLB model + ring + text label) tied to a QR code scan. Supports a grey-out timer after a configurable delay.

### Static Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `QRMarker.appState` | `object \| null` | `null` | Reference to global app state (set in `main.js`) |
| `QRMarker.font` | `THREE.Font \| null` | `null` | Shared font reference (set in `main.js`) |

### Instance Attributes (set in constructor)

| Attribute | Type | Description |
|-----------|------|-------------|
| `this.scene` | `THREE.Scene` | Scene the marker is added to |
| `this.font` | `THREE.Font` | Font for the text label |
| `this.markerHeight` | `number` | Model Y-offset (`0.8`) |
| `this.group` | `THREE.Group` | Root group added to scene |
| `this.activeMaterial` | `THREE.MeshBasicMaterial` | Red fill material (`0xff0000`) |
| `this.greyMaterial` | `THREE.MeshBasicMaterial` | Grey fill material (`0x777777`) |
| `this.outlineMaterialActive` | `THREE.LineBasicMaterial` | Dark red outline (`0x550000`) |
| `this.outlineMaterialGrey` | `THREE.LineBasicMaterial` | Dark grey outline (`0x333333`), created on grey-out |
| `this.ring` | `THREE.Mesh` | Floor ring mesh |
| `this.ringOutline` | `THREE.LineSegments` | Outline on the ring |
| `this.markerModel` | `THREE.Object3D \| null` | Loaded GLB model (async, starts `null`) |
| `this.textLabelGroup` | `THREE.Group` | Group holding text + background |
| `this.textMesh` | `THREE.Mesh` | "You are here!" text mesh |
| `this.textMaterialActive` | `THREE.MeshBasicMaterial` | Red text material |
| `this.textBgMesh` | `THREE.Mesh` | White text background plane |
| `this.textBgMaterial` | `THREE.MeshBasicMaterial` | White bg material |
| `this.startTime` | `number` | `performance.now()` at construction |
| `this.greyDelay` | `number` | Ms before grey-out (default `5 * 60000` = 5 min) |
| `this.isGrey` | `boolean` | Whether grey-out has occurred |

### Constructor

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `scene` | `THREE.Scene` | — | Scene to add the marker to |
| `position` | `THREE.Vector3` | — | World position *(currently commented out — not applied)* |
| `font` | `THREE.Font` | — | Font for the text label |
| `greyDelay` | `number` | `300000` (5 min) | Milliseconds before the marker greys out |

### Methods

| Method | Kind | Parameters | Description |
|--------|------|------------|-------------|
| `animate(time, camera)` | Instance | `time: number`, `camera: THREE.Camera` | Floating model animation, text billboarding, model look-at camera, triggers `greyOut()` after delay |
| `greyOut()` | Instance | — | Switches materials to grey, removes text label, sets `isGrey = true` |
| `clear()` | Instance | — | Removes group from scene, disposes all geometries and materials, nulls `this.group` |
