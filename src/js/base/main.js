import * as THREE from "three";
import { setupScene } from "@/js/base/sceneSetup.js";
import { setupUI } from "@/js/base/ui.js";
import { setupEventListeners } from "@/js/base/event.js";
import { startAnimationLoop } from "@/js/base/animate.js";
import { Floor } from "@/js/floor/floor.js";
import { QRMarker } from "@/js/marker/qrmarker.js";
import { loadFont } from "@/js/helper/font.js";
import { Icon } from "@/js/marker/icon.js";
import { AppState } from "@/js/base/appState.js";
import { SettingsController } from "@/js/base/settings.js";
import { Navigation } from "@/js/base/navigation.js";

const { scene, camera, renderer, controls } = setupScene();

// Register all floors with their relative CDN paths (no static imports needed).
// Models are fetched lazily from jsDelivr on first switchFloor() call.
const floorDefs = {
  l4: "models/njc-l4-v2-31-3.glb",
  l3: "models/njc-l3-v2-31-3.glb",
  l2: "models/njc-l2-v2-31-3.glb",
  l1: "models/njc-l1-v2-31-3.glb",
  b1: "models/njc-b1-v2-31-3.glb",
  b2: "models/njc-b2-v2-31-3.glb",
  b3: "models/njc-b3-v2-31-3.glb",
};

const childModelDefs = {
  canteen: "models/njc-l1-canteen.glb",
};

// Instantiate Floor objects — they self-register into Floor.floors
Object.entries(floorDefs).forEach(([id, path]) => new Floor(id, path));
Object.entries(childModelDefs).forEach(([id, path]) => new Floor(id, path));

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

export const infoLabel = document.getElementById("info");

const appState = new AppState();
appState.scene = scene;
appState.camera = camera;
appState.renderer = renderer;
appState.controls = controls;
appState.raycaster = raycaster;
appState.mouse = mouse;
appState.infoLabel = infoLabel;

QRMarker.appState = appState;
Floor.appState = appState;
Icon.appState = appState;

Navigation.init(appState);

setupEventListeners(appState);

// Initializing the application
async function initApp() {
  const font = await loadFont();
  if (font === undefined) {
    console.log("Font not loaded");
  }
  console.log(`Font: ${font}`);

  // Set font as a class attribute so handleURLQR etc. don't need it passed
  QRMarker.font = font;

  // No pre-loading — floors are fetched on-demand in Navigation.switchFloor()
  setupUI(Floor.floors);

  // Initialize modular Settings menu
  SettingsController.init('settings-content-area');
  const visualsSection = SettingsController.addSection('Visual Preferences');
  if (visualsSection) {
    SettingsController.addToggle(
      visualsSection,
      'Show POI Icons',
      'Toggle 3D points of interest markers',
      (state) => { Icon.state(state); },
      Icon.iconsVisible !== false
    );
  }

  const handleURLQR = () => {
    Navigation.handleURLQR();
  };

  // Listen for URL changes (back/forward or manual scan)
  window.addEventListener("popstate", handleURLQR);

  // Initial check — triggers first lazy load for the default floor
  handleURLQR();

  startAnimationLoop(appState);
}

initApp();
// Optional Console func
window.printCurrentFloorInfo = function () {
  const currentFloorId = appState.currentFloor ? appState.currentFloor.id : "None";
  console.log(`=== Info for Current Floor: ${currentFloorId} ===`);
};