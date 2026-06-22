import * as THREE from "three";

export default class Pipe extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.CylinderGeometry(0.08, 0.08, 6, 16)
    const material = new THREE.MeshStandardMaterial({
            color: 0xd8d8d8,
            metalness: 1.0,
            roughness: 0.15,
        })
    super(geometry, material);
    this.position.set(-4, 3, 2)
    this.rotation.x = Math.PI / 2;
    this.receiveShadow = true;
    this.castShadow = true;
    this.name = "Pipe";
  }
}    
