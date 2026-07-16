import * as THREE from "three";

export default class Floor extends THREE.Group {
  constructor() {
    super();

    const wallWidth = 22;
    const wallDepth = 22;

    // --- کف‌پوش اپوکسی ---
    const floorGeometry = new THREE.PlaneGeometry(wallWidth - 0.2, wallDepth - 0.2);
    const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xdce2d0, // سبز روشن صنعتی
    roughness: 0.3,
    metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    this.add(floor);

    // --- درین کف (استنلس استیل) ---
    const stainlessMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.4,
    metalness: 0.9
    });

    const drain = new THREE.Group();

    // بدنه اصلی درین
    const drainBody = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, 0.6), stainlessMaterial);
    drainBody.position.set(1.5, 0.01, -2.5);
    drain.add(drainBody);

    // شبکه درین
    const drainGrate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.02, 0.55), stainlessMaterial);
    drainGrate.position.set(1.5, 0.03, -2.5);
    drain.add(drainGrate);

    // اضافه کردن خطوط شبکه (ساده شده)
    for (let i = -0.2; i <= 0.2; i += 0.1) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.005, 0.02), new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 }));
    bar.position.set(1.5, 0.04, -2.5 + i);
    drain.add(bar);
    }
    this.add(drain);

  }
}    