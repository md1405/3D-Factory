import * as THREE from "three";

export default class Tank extends THREE.Mesh {
  constructor() {
     const tankGeometry = new THREE.CylinderGeometry(
      1.5,
      1.5, 
      5, 
      32
    );
    const tankMaterial = new THREE.MeshStandardMaterial({
      metalness: 1.0,
      roughness: 0.35
    }); 
    super(tankGeometry, tankMaterial);
  }
}
