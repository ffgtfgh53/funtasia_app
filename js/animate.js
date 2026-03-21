import { Icon } from "./icon.js";

export function startAnimationLoop(appState) {
  function animate() {
    requestAnimationFrame(animate);

    // Handle camera animation
    if (appState.cameraAnim && appState.cameraAnim.active) {
      const lerpFactor = 0.05;
      
      appState.camera.position.lerp(appState.cameraAnim.cameraTarget, lerpFactor);
      appState.controls.target.lerp(appState.cameraAnim.controlsTarget, lerpFactor);

      // Check if we arrived
      const posDist = appState.camera.position.distanceTo(appState.cameraAnim.cameraTarget);
      const targetDist = appState.controls.target.distanceTo(appState.cameraAnim.controlsTarget);
      
      if (posDist < 0.1 && targetDist < 0.1) {
        appState.cameraAnim.active = false;
      }
    }

    appState.controls.update();
    
    // Animate markers and icons
    const time = performance.now();
    if (appState.activeMarkers) {
      appState.activeMarkers.forEach(m => m.animate(time, appState.camera));
    }

    Icon.allIcons.forEach(icon => icon.animate(time, appState.camera));
    
    appState.renderer.render(appState.scene, appState.camera);
  }

  animate();
}
