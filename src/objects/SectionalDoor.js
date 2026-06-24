import * as THREE from 'three'

export default class SectionalDoor extends THREE.Group {
  constructor() {
    super()
    
    const floorDepth = 22;
    const wallThickness = 0.2;
    const doorWidth = 4;
    const doorHeight = 4.5;
    const panelCount = 12;
    const panelHeight = doorHeight / panelCount;

    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0xe6e6e6,
      roughness: 0.6,
      metalness: 0.3,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < panelCount; i++) {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(doorWidth, panelHeight - 0.02, 0.5),
        panelMaterial
      );

      panel.position.y = panelHeight * i + panelHeight / 2;
      this.add(panel);
    }
    this.position.set(0, 0, floorDepth /2-0.2 );
  }
}