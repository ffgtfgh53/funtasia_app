import * as THREE from "three";
import { Marker } from "./marker.js";
import { floorOrder } from "@/js/events/navigation.js";
import { Floor } from "@/js/floor/floor.js";

const BASE = ASSETS_BASE_URL;

export class Icon extends Marker {
  // Class attribute dictionary matching icontype to file path
  // The path points to a folder in assets called icon
  static iconPaths = {
    'lift': `${BASE}/icons/lift.png`,
    'stair-u': `${BASE}/icons/stair-u.png`,
    'stair-d': `${BASE}/icons/stair-d.png`,
    'stair-ud': `${BASE}/icons/stair-ud.png`,
    'mtoilet': `${BASE}/icons/mtoilet.png`,
    'ftoilet': `${BASE}/icons/ftoilet.png`,
    'atoilet': `${BASE}/icons/atoilet.png`,
    'door': `${BASE}/icons/door.png`
  };

  // State flag for all icons visibility
  static iconsVisible = true;
  
  // Track active level to only show icons for the current level
  static activeLevel = null;

  // Track icons mapped by their level
  static iconsByLevel = {};

  constructor(parent, type, position, level) {
    super(parent, position, level);
    
    this.icontype = type;
    this.iconPath = Icon.iconPaths[this.icontype]; 

    // Use TextureLoader to load high quality PNGs
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(this.iconPath, (tex) => {
      // Load aspect ratio once texture is ready
      this.aspect = tex.image.width / tex.image.height;
      if (this.indicator) {
        this.indicator.scale.set(this.baseScale * this.aspect, this.baseScale, 1);
      }
    });
    
    // High-quality texture settings
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 16; 

    // Using SpriteMaterial / Sprite so the icon always faces the camera (billboarding)
    this.material = new THREE.SpriteMaterial({ 
      map: texture, 
      transparent: true,
      depthTest: true 
    });

    this.indicator = new THREE.Sprite(this.material);
    this.baseScale = 0.4;
    this.aspect = 1.0;

    this.indicator.scale.set(this.baseScale, this.baseScale, 1);
    
    // Elevate icon slightly above floor level
    this.indicator.position.y = 0.5; 

    this.group.add(this.indicator);

    // Apply the current global visibility state
    this.group.visible = Icon.iconsVisible && this.level === Icon.activeLevel;

    // Track this instance by its level
    if (!Icon.iconsByLevel[this.level]) {
      Icon.iconsByLevel[this.level] = [];
    }
    Icon.iconsByLevel[this.level].push(this);
  }

  // Class method to control visibility state of all icons
  static state(isVisible) {
    Icon.iconsVisible = isVisible;
    Icon.updateVisibility();
  }

  // Method to set active level
  static setLevel(levelId) {
    Icon.activeLevel = levelId;
    Icon.updateVisibility();
  }

  // Helper method to sync visibility across instances, optimized for levels
  static updateVisibility() {
    const activeFloor = Floor.floors[Icon.activeLevel];
    const isViewingChild = !!activeFloor?.parentFloorId;
    const activeRefFloorId = activeFloor?.parentFloorId || Icon.activeLevel;
    const activeIdx = floorOrder.indexOf(activeRefFloorId);

    Object.keys(Icon.iconsByLevel).forEach((level) => {
      const iconFloor = Floor.floors[level];
      const iconRefFloorId = iconFloor?.parentFloorId || level;
      const levelIdx = floorOrder.indexOf(iconRefFloorId);
      
      // If child active, hide all ghosts. Otherwise, standard ghost logic.
      const isGhost = !isViewingChild && window.ghostLayersEnabled && levelIdx < activeIdx && activeIdx !== -1;
      const isLevelActive = (level === Icon.activeLevel) || isGhost;

      Icon.iconsByLevel[level].forEach((icon) => {
        if (icon.group) {
          icon.group.visible = Icon.iconsVisible && isLevelActive;
        }
      });
    });
  }

  // Animate method to handle dynamic scaling
  animate(time, camera) {
    if (!this.group || !this.indicator) return;

    // Calculate distance and update scale
    const worldPos = new THREE.Vector3();
    this.indicator.getWorldPosition(worldPos);
    const distance = camera.position.distanceTo(worldPos);
    
    const factor = 0.08; 
    const targetScale = distance * factor;
    
    // Constraints:
    // 1. Zoom out: Cap at original size
    const finalScale = Math.min(this.baseScale, targetScale);
    
    const activeFloor = Floor.floors[Icon.activeLevel];
    const isViewingChild = !!activeFloor?.parentFloorId;
    const activeRefFloorId = activeFloor?.parentFloorId || Icon.activeLevel;
    const activeIdx = floorOrder.indexOf(activeRefFloorId);
    
    const iconFloor = Floor.floors[this.level];
    const iconRefFloorId = iconFloor?.parentFloorId || this.level;
    const levelIdx = floorOrder.indexOf(iconRefFloorId);
    const isGhost = !isViewingChild && window.ghostLayersEnabled && levelIdx < activeIdx && activeIdx !== -1;
    const isLevelActive = (this.level === Icon.activeLevel) || isGhost;

    // 2. Zoom in: Hide if less than a quarter of original size
    const isVisible = finalScale >= (this.baseScale / 4.5) && Icon.iconsVisible && isLevelActive;

    this.group.visible = isVisible;
    if (isVisible) {
      this.indicator.scale.set(finalScale * this.aspect, finalScale, 1);
    }
  }

  // Cleanup to prevent memory leaks
  clear() {
    super.clear(); // handles removing group from scene

    if (this.material) {
      if (this.material.map) this.material.map.dispose();
      this.material.dispose();
    }

    // Remove from the static tracking dictionary
    if (Icon.iconsByLevel[this.level]) {
      const index = Icon.iconsByLevel[this.level].indexOf(this);
      if (index > -1) {
        Icon.iconsByLevel[this.level].splice(index, 1);
      }
    }
  }
}
