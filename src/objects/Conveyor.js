import * as THREE from 'three'

export default class Conveyor extends THREE.Group {
  constructor() {
    super()
    
    // Simple configuration 
    this.config = {
      length: 10,        // conveyor belt length
      width: 1.2,        // belt width
      beltThickness: 0.1,  
      rollerRadius: 0.2,    
      legHeight: 1.5,     
      yPosition: 2,       // total belt height from the ground (matches your tanks)
      zPosition: 3,       // depth position (same as your centerZ)
      bottleGroupOffsetY: 0.5 //  bottle height on the belt
    }

    //  Materials
    this.materials = {
      belt: new THREE.MeshStandardMaterial({
        color: 0x2c3e50,
        roughness: 0.8,
        metalness: 0.1
      }),
      roller: new THREE.MeshStandardMaterial({
        color: 0xbdc3c7,
        roughness: 0.3,
        metalness: 0.9
      }),
      support: new THREE.MeshStandardMaterial({
        color: 0x7f8c8d,  
        roughness: 0.4,
        metalness: 0.7
      }),
      detail: new THREE.MeshStandardMaterial({
        color: 0x7f8c8d,
        roughness: 0.4,
        metalness: 0.7
      })
    }

    // Building a hierarchical structure
    // Conveyor (this)
    //   ├── Belt System
    //   ├── Rollers (Start, End)
    //   ├── Supports (Legs)
       
    this.beltSystem = new THREE.Group()
    this.rollersGroup = new THREE.Group()
    this.supportsGroup = new THREE.Group()
    
    this.add(this.beltSystem)
    this.add(this.rollersGroup)
    this.add(this.supportsGroup)

    // Calling construction methods
    this.createBeltSystem()
    this.createRollers()
    this.createSupports()
  }

  // Making the strap and edges
  createBeltSystem() {
    const { length, width, beltThickness, yPosition, zPosition } = this.config
    
    // Main belt (rubber)
    const beltGeo = new THREE.BoxGeometry(length, beltThickness, width)
    const belt = new THREE.Mesh(beltGeo, this.materials.belt)
    belt.position.set(0, yPosition, zPosition)
    belt.castShadow = true
    belt.receiveShadow = true
    this.beltSystem.add(belt)
    
    // Metal side edges for realism
    const edgeThickness = 0.05
    const edgeHeight = 0.15
    const edgeGeo = new THREE.BoxGeometry(length, edgeHeight, edgeThickness)
    
    const frontEdge = new THREE.Mesh(edgeGeo, this.materials.detail)
    frontEdge.position.set(0, yPosition + 0.05, zPosition + width/2)
    this.beltSystem.add(frontEdge)
    
    const backEdge = new THREE.Mesh(edgeGeo, this.materials.detail)
    backEdge.position.set(0, yPosition + 0.05, zPosition - width/2)
    this.beltSystem.add(backEdge)
  }

  // Making the beginning and end rollers
  createRollers() {
    const { length, width, rollerRadius, yPosition, zPosition } = this.config
    
    const rollerGeo = new THREE.CylinderGeometry(rollerRadius, rollerRadius, width, 32)
    
    // Starting roller (left)
    this.rollerStart = new THREE.Mesh(rollerGeo, this.materials.roller)
    this.rollerStart.position.set(-length/2 + rollerRadius, yPosition, zPosition)
    this.rollerStart.rotation.z = Math.PI / 2 // افقی کردن استوانه
    this.rollerStart.rotation.y = Math.PI / 2 // چرخاندناستوانه
    this.rollerStart.castShadow = true
    this.rollersGroup.add(this.rollerStart)
    
    // End roller (right)
    this.rollerEnd = new THREE.Mesh(rollerGeo, this.materials.roller)
    this.rollerEnd.position.set(length/2 - rollerRadius, yPosition, zPosition)
    this.rollerEnd.rotation.z = Math.PI / 2 // افقی کردن استوانه
    this.rollerEnd.rotation.y = Math.PI / 2 // چرخاندناستوانه
    this.rollerEnd.castShadow = true
    this.rollersGroup.add(this.rollerEnd)
    
    // Roller side discs for more details
    const diskGeo = new THREE.CylinderGeometry(rollerRadius + 0.05, rollerRadius + 0.05, 0.05, 16)
    const positions = [
      { x: -length/2 + rollerRadius, z: zPosition + width/2 },
      { x: -length/2 + rollerRadius, z: zPosition - width/2 },
      { x: length/2 - rollerRadius, z: zPosition + width/2 },
      { x: length/2 - rollerRadius, z: zPosition - width/2 }
    ]
    
    positions.forEach(pos => {
      const disk = new THREE.Mesh(diskGeo, this.materials.detail)
      disk.position.set(pos.x, yPosition, pos.z)
      this.rollersGroup.add(disk)
    })
  }

  // Building the bases
  createSupports() {
    const { length, width, legHeight, yPosition, zPosition } = this.config
    
    // Base pair along the strip
    const supportCount = 4
    const spacing = length / (supportCount + 1)
    
    for (let i = 1; i <= supportCount; i++) {
      const xPos = -length/2 + i * spacing
      const supportGroup = new THREE.Group()
      
      // Two vertical legs
      const legGeo = new THREE.BoxGeometry(0.1, legHeight, 0.1)
      
      const frontLeg = new THREE.Mesh(legGeo, this.materials.support)
      frontLeg.position.set(0, legHeight/2, width/2 - 0.1)
      frontLeg.castShadow = true
      frontLeg.receiveShadow = true
      
      const backLeg = new THREE.Mesh(legGeo, this.materials.support)
      backLeg.position.set(0, legHeight/2, -width/2 + 0.1)
      backLeg.castShadow = true
      backLeg.receiveShadow = true
      
      supportGroup.add(frontLeg)
      supportGroup.add(backLeg)
      
      // Horizontal connecting rod
      const barGeo = new THREE.BoxGeometry(0.08, 0.08, width - 0.2)
      const bar = new THREE.Mesh(barGeo, this.materials.detail)
      bar.position.set(0, legHeight * 0.15, 0) // نزدیک زمین
      supportGroup.add(bar)
      
      // Placement of the base group
      supportGroup.position.set(xPos, yPosition - legHeight, zPosition)
      this.supportsGroup.add(supportGroup);

    }

    this.rotation.y = Math.PI / 2;
    this.position.set(-3.5, -0.5, -1);
    this.userData.equipmentId = "conveyor";
  }
}