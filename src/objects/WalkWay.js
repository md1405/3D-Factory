import * as THREE from "three";

export default class WalkWay extends THREE.Group {
  constructor() {
    super();
    const wallDepth = 22;
    const geometry = new THREE.BoxGeometry(22, 0.02, 1.5);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xb8c0c8,
    });
    const centerLine = new THREE.Mesh(geometry, material);
    
    centerLine.position.set(0, 0, 2);
    centerLine.receiveShadow = true;
    centerLine.name = "centerLine";
    
    this.add(centerLine);

    [2.75, 1.25].forEach(pos => {
      const sideLine = new THREE.Mesh(  
        new THREE.BoxGeometry(22, 0.02, 0.15),
        new THREE.MeshStandardMaterial({
          color: 0xffff00
        })
      );
      
      sideLine.position.set(
        0,
        0,
        pos
      );
      this.add(sideLine);
    });
    this.rotation.y = Math.PI /2 ;
    this.position.set(-3.5, 0, 0);

  }
}