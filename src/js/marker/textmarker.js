import * as THREE from "three";
import { Marker, FONT_URL } from "@/js/marker/marker.js";
import { Text } from "troika-three-text";

export class TextMarker extends Marker {
  static allTextMarkers = [];

  /**
   * @param {THREE.Scene} scene - Scene to add the marker to.
   * @param {THREE.Vector3} position - World position of the marker.
   * @param {string} name - The text to render.
   */
  constructor(scene, position, name) {
    super(position);
    this.scene = scene;
    this.name = name;
    
    // Default marker height above the position
    this.markerHeight = 0.8;

    this._textLabelGroup = new THREE.Group();

    const textMesh = new Text();
    textMesh.text = this.name;
    textMesh.fontSize = 0.15;
    textMesh.font = FONT_URL;
    textMesh.color = 0x000000;
    textMesh.anchorX = 'center';
    textMesh.anchorY = 'middle';
    textMesh.sync();

    // Padded background behind the text
    const bgWidth = 1.2;
    const bgHeight = 0.25;
    const textBgMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const textBgMesh = new THREE.Mesh(new THREE.PlaneGeometry(bgWidth, bgHeight), textBgMaterial);
    textBgMesh.position.z = -0.01;

    this._textLabelGroup.add(textBgMesh);
    this._textLabelGroup.add(textMesh);
    this._textLabelGroup.position.y = this.markerHeight;
    this.group.add(this._textLabelGroup);

    if (this.scene) {
      this.scene.add(this.group);
    }
    
    TextMarker.allTextMarkers.push(this);
  }


  /**
   * Updates the marker each frame: billboards the text label.
   * @param {number} time - Elapsed time in milliseconds.
   * @param {THREE.Camera} camera - The active camera.
   */
  animate(time, camera) {
    if (!this.group) return;

    // Billboarding — keep the text label facing the camera
    if (this._textLabelGroup && camera) {
      this._textLabelGroup.quaternion.copy(camera.quaternion);
      this._textLabelGroup.position.y = this.markerHeight;
    }
  }

  clear() {
    if (this.group) {
      if (this.scene) {
        this.scene.remove(this.group);
      }

      this.group.traverse((child) => {
        if (child.isMesh || child.isLine || child.isLineSegments) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        }
      });

      this.group = null;
    }

    const index = TextMarker.allTextMarkers.indexOf(this);
    if (index > -1) {
      TextMarker.allTextMarkers.splice(index, 1);
    }
  }
}
