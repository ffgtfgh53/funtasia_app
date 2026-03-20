import { 
  isPointerOverUI, 
  handleInteraction, 
  updateMousePosition, 
  updateMouseFromTouch 
} from "./util.js";

export function setupEventListeners(renderer, mouse, appState, raycaster, camera, infoLabel, controls) {
  /* 
    GESTURE ISOLATION LOGIC:
    The code below isolates Rotate (parallel 2-finger movement) and Zoom (pinch 2-finger movement) 
    by dynamically toggling OrbitControls' enableZoom and enableRotate flags.
    
    TO REVERT TO SIMPLE CONTROLS:
    1. Remove 'touchGestureMode' and 'prevTouches' variables below.
    2. In 'touchstart', remove the "Reset control state" block.
    3. In 'touchmove', remove the "Process gesture detection" block.
    4. In 'touchend', remove the "Restore default state" block.
  */
  let touchGestureMode = null;
  let prevTouches = [];
  window.addEventListener("mousemove", (event) => {
    if (isPointerOverUI(event)) return;
    updateMousePosition(event.clientX, event.clientY, renderer, mouse);
  });

  window.addEventListener("mousedown", () => {
    appState.pointerStartTime = Date.now();
  });

  window.addEventListener("touchstart", (event) => {
    if (isPointerOverUI(event)) return;
    appState.pointerStartTime = Date.now();
    updateMouseFromTouch(event, renderer, mouse);
    
    // [GUESTURE ISOLATION] Reset control state on new touches
    if (event.touches.length === 2 || event.touches.length < 2) {
      touchGestureMode = null;
      controls.enableZoom = true;
      controls.enableRotate = true;
    }
    prevTouches = Array.from(event.touches).map(t => ({ clientX: t.clientX, clientY: t.clientY }));
  }, { passive: false });

  window.addEventListener("touchmove", (event) => {
    if (isPointerOverUI(event)) return;
    
    // [GUESTURE ISOLATION] Process gesture detection
    if (event.touches.length === 2 && prevTouches.length === 2) {
      const p1 = prevTouches[0];
      const p2 = prevTouches[1];
      const c1 = event.touches[0];
      const c2 = event.touches[1];

      const v1 = { x: c1.clientX - p1.clientX, y: c1.clientY - p1.clientY };
      const v2 = { x: c2.clientX - p2.clientX, y: c2.clientY - p2.clientY };

      const mag1 = Math.hypot(v1.x, v1.y);
      const mag2 = Math.hypot(v2.x, v2.y);

      // Determine gesture only if fingers moved sufficiently
      if (!touchGestureMode && mag1 > 2 && mag2 > 2) {
        const dot = (v1.x * v2.x + v1.y * v2.y) / (mag1 * mag2);
        
        if (dot > 0.7) { 
          // Parallel movement -> Rotate Mode
          touchGestureMode = 'rotate';
          controls.enableZoom = false;
          controls.enableRotate = true;
        } else if (dot < -0.5) {
          // Opposite movement -> Zoom Mode
          touchGestureMode = 'zoom';
          controls.enableRotate = false;
          controls.enableZoom = true;
        }
      }
    }
    
    // Update previous touches
    if (event.touches.length > 0) {
      prevTouches = Array.from(event.touches).map(t => ({ clientX: t.clientX, clientY: t.clientY }));
    }

    if (event.touches.length > 0) {
      updateMouseFromTouch(event, renderer, mouse);
      event.preventDefault();
    }
  }, { passive: false });

  window.addEventListener("touchend", (event) => {
    if (isPointerOverUI(event)) return;
    
    // [GUESTURE ISOLATION] Restore default state when fingers are removed
    if (event.touches.length < 2) {
      touchGestureMode = null;
      controls.enableZoom = true;
      controls.enableRotate = true;
    }
    prevTouches = Array.from(event.touches).map(t => ({ clientX: t.clientX, clientY: t.clientY }));

    updateMouseFromTouch(event, renderer, mouse);
    event.preventDefault();
    handleInteraction(event, appState, raycaster, mouse, camera, infoLabel, controls);
  }, { passive: false });

  window.addEventListener("click", (event) => {
    handleInteraction(event, appState, raycaster, mouse, camera, infoLabel, controls);
  });

  window.addEventListener("camera-interaction-start", () => {
    if (appState.cameraAnim && appState.cameraAnim.active) {
      appState.cameraAnim.active = false;
    }
  });
}
