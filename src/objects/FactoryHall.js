import * as THREE from "three";

export default class Light extends THREE.Group {
  constructor() {
    super()
    // Hall dimensions
    const wallWidth = 22;
    const wallHeight = 8;
    const wallDepth = 22;
    const wallThickness = 0.2;
    const roofHeight = 1.5;   

    // Walls
        const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xf0e6d3,
        roughness: 0.6,
        metalness: 0.1,
        side: THREE.DoubleSide,
    });

    // front wall
    const frontWallShape = new THREE.Shape();

    frontWallShape.moveTo(-wallWidth / 2, 0);
    frontWallShape.lineTo(-wallWidth / 2, wallHeight);
    frontWallShape.lineTo(0, wallHeight + roofHeight);
    frontWallShape.lineTo(wallWidth / 2, wallHeight);
    frontWallShape.lineTo(wallWidth / 2, 0);
    frontWallShape.closePath();

    const frontWallGeometry = new THREE.ExtrudeGeometry(
      frontWallShape,
      {
          depth: wallThickness,
          bevelEnabled: false,
      }
    );

    const frontWall = new THREE.Mesh(
      frontWallGeometry,
      wallMaterial
    );

    frontWall.position.set(
      0,
      0,
      wallDepth / 2 - wallThickness / 2
    );

    frontWall.geometry.translate(
      0,
      0,
      -wallThickness / 2
    );    

    this.add(frontWall);

    // back wall
    const backWall = new THREE.Mesh(
        frontWallGeometry.clone(),
        wallMaterial
    );

    backWall.position.set(
        0,
        0,
        -wallDepth / 2 + wallThickness / 2
    );

    backWall.rotation.y = Math.PI;    

    this.add(backWall);

    // left wall
    const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, wallDepth),
        wallMaterial
    );
    leftWall.position.set(-wallWidth/2, wallHeight/2, 0);
    this.add(leftWall);

    // right wall 
    const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, wallDepth),
        wallMaterial
    );
    rightWall.position.set(wallWidth/2, wallHeight/2, 0);
    this.add(rightWall);

    // Walls Group 
    const wallsGroup = new THREE.Group();
    wallsGroup.add(frontWall, backWall, leftWall, rightWall);
    wallsGroup.name = 'Walls';

    // Roof 
    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.7,
        metalness: 0.1,
        side: THREE.DoubleSide,
    });

    const halfWidth = wallWidth / 2;
    const halfDepth = wallDepth / 2;

    //  vertices
    const vertices = new Float32Array([
        // left
        -halfWidth, wallHeight, -halfDepth, // 0
        0, wallHeight + roofHeight, -halfDepth, // 1
        -halfWidth, wallHeight,  halfDepth, // 2

        0, wallHeight + roofHeight, -halfDepth, // 1
        0, wallHeight + roofHeight,  halfDepth, // 3
        -halfWidth, wallHeight,  halfDepth, // 2

        // right
        0, wallHeight + roofHeight, -halfDepth, // 4
        halfWidth, wallHeight, -halfDepth, // 5
        0, wallHeight + roofHeight,  halfDepth, // 6

        0, wallHeight + roofHeight,  halfDepth, // 6
        halfWidth, wallHeight, -halfDepth, // 5
        halfWidth, wallHeight,  halfDepth, // 7
    ]);

    const roofGeometry = new THREE.BufferGeometry();
    roofGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(vertices, 3)
    );

    roofGeometry.computeVertexNormals();

    const roof = new THREE.Mesh(
        roofGeometry,
        roofMaterial
    );

    roof.name = "Roof";

    this.add(roof);

    //add to group
    this.add(wallsGroup);

    // columns
    const columnMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.3,
        metalness: 0.7,
    });

    const columnPositions = [
        [-6, -8],
        [-6, 8],
        [6, -8],
        [6, 8]
    ];

    columnPositions.forEach(([x, z]) => {
        const column = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.25, wallHeight+1.3, 8),
            columnMaterial
        );
        column.position.set(x, wallHeight/2, z);
        this.add(column);
    });

    // floor
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.9,
        metalness: 0,
        side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(wallWidth - 0.2, wallDepth - 0.2),
        floorMaterial
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.01, 0);
    this.add(floor);

    this.name = 'FactoryHall';
  }
}