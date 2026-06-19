import * as THREE from "three";

export default class LoadingArea extends THREE.Group {
  constructor() {
    super();
    const wallDepth = 22;
    const geometry = new THREE.BoxGeometry(8, 0.3, 4);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x9a9a9a,
      roughness: 0.9,
    });
    const loadingArea = new THREE.Mesh(geometry, material);
    
    loadingArea.position.set(0, 0.1, wallDepth / 2 + 1.5);
    loadingArea.receiveShadow = true;
    loadingArea.name = "LoadingArea";
    
    this.add(loadingArea);

    [3.0, 0.5].forEach(pos => {
      const safetyLine = new THREE.Mesh(  
        new THREE.BoxGeometry(8, 0.02, 0.15),
        new THREE.MeshStandardMaterial({
          color: 0xffff00
        })
      );
      
      safetyLine.position.set(
        0,
        0.3,
        wallDepth / 2 + pos
      );
      this.add(safetyLine);
    });
  }
}