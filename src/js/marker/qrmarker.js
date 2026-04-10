import * as THREE from "three";
import { LocationMarker } from "@/js/marker/marker.js";

export class QRMarker extends LocationMarker {
  // Static class attribute initialized in main.js
  static appState = null;

  /**
   * @param {THREE.Scene} scene - Scene to add the marker to.
   * @param {THREE.Vector3} position - World position of the marker.
   * @param {number} greyDelay - Milliseconds before the marker greys out (default 5 min).
   */
  constructor(scene, position, greyDelay = 5 * 60000) {
    // Always rendered with the text label
    super(scene, position, true);

    // Grey-out materials (created lazily in greyOut())
    this.greyMaterial = new THREE.MeshBasicMaterial({ color: 0x777777 });
    this.outlineMaterialGrey = null;

    this.startTime = performance.now();
    this.greyDelay = greyDelay;
    this.isGrey = false;
  }

  /**
   * Delegates floating/billboarding to LocationMarker.animate, then handles grey-out timer.
   * @param {number} time - Elapsed time in milliseconds.
   * @param {THREE.Camera} camera - The active camera.
   */
  animate(time, camera) {
    if (!this.group) return;

    super.animate(time, camera);

    if (!this.isGrey && time - this.startTime > this.greyDelay) {
      this.greyOut();
    }
  }

  greyOut() {
    this.outlineMaterialGrey = new THREE.LineBasicMaterial({ color: 0x333333 });

    this.group.traverse((child) => {
      if (child.isMesh) {
        child.material = this.greyMaterial;
      } else if (child.isLine || child.isLineSegments) {
        child.material = this.outlineMaterialGrey;
      }
    });

    // Remove the text label once greyed out
    if (this._textLabelGroup) {
      this.group.remove(this._textLabelGroup);
      this._textLabelGroup = null;
    }

    this.isGrey = true;
  }

  clear() {
    if (this.group) {
      this.scene.remove(this.group);

      this.group.traverse((child) => {
        if (child.isMesh || child.isLine || child.isLineSegments) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        }
      });

      this.group = null;
    }

    if (this.greyMaterial) this.greyMaterial.dispose();
    if (this.outlineMaterialGrey) this.outlineMaterialGrey.dispose();
  }
}