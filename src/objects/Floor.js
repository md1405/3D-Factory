import * as THREE from "three";

export default class Floor extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.PlaneGeometry(
        30,
        30
    );
    const material = new THREE.MeshStandardMaterial({ 
        color:0xcccccc
    });
    super(geometry, material);
    this.rotation.x = -Math.PI / 2;
    this.receiveShadow = true;
    this.name = "FactoryFloor";
  }
}