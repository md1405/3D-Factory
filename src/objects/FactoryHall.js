import * as THREE from "three";

export default class FactoryHall extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.BoxGeometry(
        20,
        8,
        20
    );
    const material = new THREE.MeshStandardMaterial({ 
        color:0xe8e8e8,
        side:THREE.BackSide
    });
    super(geometry, material);
    this.position.y = 4;
  }
}