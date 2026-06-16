import * as THREE from 'three'

export default class Canveyor extends THREE.Group {
  constructor() {
    super()
    const conveyorGeometry = new THREE.BoxGeometry(
        14, 
        0.3, 
        2
    ); 
    const conveyorMaterial = new THREE.MeshStandardMaterial({
      metalness: 1.0,
      roughness: 0.35, 
      color:0x69666e,
    });
    this.conveyor = new THREE.Mesh(conveyorGeometry, conveyorMaterial);
    this.conveyor.position.set(0, 2, 3);
    this.add(this.conveyor);
    const conveyorBaseGeometry = new THREE.BoxGeometry(
        0.5, 
        2, 
        0.5
    ); 
    const conveyorBaseMaterial = new THREE.MeshStandardMaterial({
      metalness: 1.0,
      roughness: 0.35, 
      color:0x69666e,
    });
    const conveyorBases = [];
    const positions = [
        { x: -6.75, y: 1, z: 3.75 },
        { x: -6.75, y: 1, z: 2.25 },
        { x: 6.75, y: 1, z: 3.75 },
        { x: 6.75, y: 1, z: 2.25 }
    ];
    positions.forEach(pos => {
        const conveyorBase = new THREE.Mesh(conveyorBaseGeometry, conveyorBaseMaterial);
        conveyorBase.castShadow = true;
        conveyorBase.receiveShadow = true;
        conveyorBase.position.set(pos.x, pos.y, pos.z);
        this.add(conveyorBase);
        conveyorBases.push(conveyorBase);
    });    
  }
}
