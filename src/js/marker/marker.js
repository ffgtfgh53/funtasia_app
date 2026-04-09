import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const BASE = ASSETS_BASE_URL;
const googleMapIconUrl = `${BASE}/icons/google-map-icon.glb`;

export class Marker {
  constructor() {
    // Barebone structure
  }
}

export class LocationMarker extends Marker {
  constructor() {
    super();
    // Barebone structure
  }
}

/**
 * Creates a reusable marker group containing a GLB model, a ring, and optional text.
 * @param {THREE.Font} font - The font to use for the text label.
 * @param {boolean} text - Whether to include the text label.
 * @returns {THREE.Group} - The marker group.
 */
export function createMarkerGroup(font, text = false) {
  const group = new THREE.Group();
  const markerHeight = 0.8;

  // ----- materials -----
  const activeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const outlineMaterialActive = new THREE.LineBasicMaterial({ color: 0x550000 });

  // ----- ring -----
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.11, 0.14, 32),
    activeMaterial
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;

  const ringEdges = new THREE.EdgesGeometry(ring.geometry);
  const ringOutline = new THREE.LineSegments(ringEdges, outlineMaterialActive);
  ring.add(ringOutline);
  group.add(ring);

  // ----- 3D Model for marker -----
  const loader = new GLTFLoader();
  loader.load(googleMapIconUrl, (gltf) => {
    const markerModel = gltf.scene;

    // Apply activeMaterial and add outlines to all meshes in the model
    markerModel.traverse((child) => {
      if (child.isMesh) {
        child.material = activeMaterial;

        const edges = new THREE.EdgesGeometry(child.geometry, 60);
        const outline = new THREE.LineSegments(edges, outlineMaterialActive);
        child.add(outline);
      }
    });

    // Adjust scale and position
    const scale = 10;
    markerModel.scale.set(scale, scale, scale);
    markerModel.position.y = markerHeight;
    group.add(markerModel);
  });

  // ----- text label group -----
  if (text && font) {
    const textLabelGroup = new THREE.Group();

    const message = "You are here!";
    const shapes = font.generateShapes(message, 0.15);
    const geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();
    const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
    geometry.translate(xMid, 0, 0);

    const textMaterialActive = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });

    const textMesh = new THREE.Mesh(geometry, textMaterialActive);

    // Background for text
    const padding = 0.05;
    const bgWidth = (geometry.boundingBox.max.x - geometry.boundingBox.min.x) + padding * 2;
    const bgHeight = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) + padding * 2;
    const bgGeom = new THREE.PlaneGeometry(bgWidth, bgHeight);
    const textBgMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const textBgMesh = new THREE.Mesh(bgGeom, textBgMaterial);

    // Position BG behind text and centered
    textBgMesh.position.z = -0.01;
    textBgMesh.position.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;

    textLabelGroup.add(textBgMesh);
    textLabelGroup.add(textMesh);

    textLabelGroup.position.y = markerHeight + 0.4; // Above the diamond/model
    group.add(textLabelGroup);
  }

  return group;
}
