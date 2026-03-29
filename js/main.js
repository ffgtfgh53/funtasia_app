import * as THREE from "three";
import { setupScene } from "./sceneSetup.js";
import { loadModels } from "./modelLoader.js";
import { setupUI } from "./ui.js";
import { setupEventListeners } from "./event.js";
import { startAnimationLoop } from "./animate.js";
import { Floor } from "./floor.js";
import { QRMarker } from "./marker.js";
import { loadFont } from "./font.js";
import { Icon } from "./icon.js";
import { AppState } from "./appState.js";

const { scene, camera, renderer, controls } = setupScene();

const floorPaths = {
  l4: "./assets/models/njc-l1.glb",
  l3: "./assets/models/njc-l1.glb",
  l2: "./assets/models/njc-l2.glb",
  l1: "./assets/models/njc-l1.glb",
  b1: "./assets/models/njc-b1.glb",
  b2: "./assets/models/njc-b2.glb",
  b3: "./assets/models/njc-b3.glb",
};

const childModelPaths = {
  canteen: "./assets/models/njc-l1-canteen.glb",
};

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

// Set class attributes for static methods
QRMarker.appState = appState;
Floor.appState = appState;
Floor.QRMarker = QRMarker; // Inject to avoid circular dependency in floor.js
Icon.appState = appState;

setupEventListeners(appState);

// Initializing the application
async function initApp() {
  const font = await loadFont();
  if (font === undefined) {
    console.log("Font not loaded");
  }
  console.log(`Font: ${font}`)
  
  // Set font as a class attribute so handleURLQR etc. don't need it passed
  QRMarker.font = font;

  const { floors } = await loadModels(appState, floorPaths);
  await loadModels(appState, childModelPaths);
  
  setupUI(floors);

  // Temporary UI button for toggling icons
  const toggleBtn = document.createElement("button");
  toggleBtn.innerText = "Toggle Icons";
  toggleBtn.style.position = "absolute";
  toggleBtn.style.bottom = "20px";
  toggleBtn.style.left = "20px";
  toggleBtn.style.zIndex = "1000";
  toggleBtn.style.padding = "10px";
  toggleBtn.style.background = "rgba(255, 255, 255, 0.8)";
  toggleBtn.style.border = "1px solid #ccc";
  toggleBtn.style.borderRadius = "5px";
  toggleBtn.style.cursor = "pointer";
  
  toggleBtn.onclick = () => {
    Icon.state(!Icon.iconsVisible);
  };
  document.body.appendChild(toggleBtn);

  const handleURLQR = () => {
    QRMarker.handleURLQR();
  };

  // Listen for URL changes (back/forward or manual scan)
  window.addEventListener("popstate", handleURLQR);
  
  // Initial check
  handleURLQR();

  startAnimationLoop(appState);
}

initApp();
// Optional Console func
window.printCurrentFloorInfo = function () {
  const currentFloorId = appState.currentFloor ? appState.currentFloor.id : "None";
  console.log(`=== Info for Current Floor: ${currentFloorId} ===`);
};