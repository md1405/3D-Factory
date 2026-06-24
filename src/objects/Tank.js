import * as THREE from "three";

export default class Tank extends THREE.Group {
  constructor() {
    super();
    // body
    const bodyGeometry = new THREE.CylinderGeometry(1, 1, 4, 64);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xd8d8d8,
      metalness: 1.0,
      roughness: 0.15,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    this.add(body);

    // top
    const topGeometry = new THREE.SphereGeometry(1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const top = new THREE.Mesh(topGeometry, bodyMaterial);
    top.position.y = 2; // Half the body height
    top.castShadow = true;
    top.receiveShadow = true;
    this.add(top);

    // bottom
    const bottomGeometry = new THREE.SphereGeometry(
      1, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2
    );
    const bottom = new THREE.Mesh(bottomGeometry, bodyMaterial);
    bottom.position.y = -2;
    bottom.castShadow = true;
    bottom.receiveShadow = true;
    this.add(bottom);

    // legs
    const legGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.1);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0xb0b0b0,
      metalness: 1.0,
      roughness: 0.2,
    });

    const legPositions = [
      { x: 0.7, z: 0.7 },
      { x: -0.7, z: 0.7 },
      { x: 0.7, z: -0.7 },
      { x: -0.7, z: -0.7 },
    ];

    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(pos.x, -2.75, pos.z);
      leg.castShadow = true;
      leg.receiveShadow = true;
      this.add(leg);
    });
    
    const ladderGroup = new THREE.Group();
    ladderGroup.name = "TankLadder";

    const railGeometry = new THREE.BoxGeometry(0.05, 3, 0.05);
    const rungGeometry = new THREE.BoxGeometry(0.3, 0.04, 0.04);

    // Two columns
    [-0.15, 0.15].forEach(xOffset => {
      const rail = new THREE.Mesh(railGeometry, legMaterial);
      rail.position.set(xOffset, -0.5, 1.05);
      rail.castShadow = true;
      ladderGroup.add(rail);
    });

    // Stairs
    for (let i = 0; i < 8; i++) {
      const rung = new THREE.Mesh(rungGeometry, legMaterial);
      rung.position.set(0, -1.8 + i * 0.35, 1.05);
      rung.castShadow = true;
      ladderGroup.add(rung);
    }
    ladderGroup.position.set(0, 1, 0);
    this.add(ladderGroup);

    // platform
    const platformGeometry = new THREE.BoxGeometry(1.6, 0.1, 0.6);
    const platform = new THREE.Mesh(platformGeometry, legMaterial);
    platform.position.set(0, 2.05, 1.0);
    platform.castShadow = true;
    platform.receiveShadow = true;
    platform.name = "TankPlatform";
    this.add(platform);

    this.rotation.y = -Math.PI /2

    this.castShadow = true;
    this.receiveShadow = true;

    this.TankLadder = ladderGroup;   
    this.TankPlatform = platform;   

  }
}