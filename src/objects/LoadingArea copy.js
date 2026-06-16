import * as THREE from "three";

export default class LoadingArea extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.BoxGeometry(
        8,
        0.3,
        2
    );
    const material = new THREE.MeshStandardMaterial({ 
        color:0xe5e5e5
    });
    super(geometry, material);
    this.position.set(0, 0.15, 12);
    this.receiveShadow = true;
    this.name = "LoadingArea";
  }
}