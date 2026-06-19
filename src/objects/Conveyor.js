import * as THREE from 'three'

export default class Conveyor extends THREE.Group {
  constructor() {
    super()
    
    // Initial settings
    this.config = {
      totalWidth: 14,
      totalDepth: 2,
      thickness: 0.3,
      edgeSize: 0.3,
      legHeight: 2,
      legRadius: 0.1,
      legSpacingZ: 1.5,
      tubeRadius: 0.08,
      baseSpacing: 2.5,
      centerZ: 3,
      xRange: { start: -6, end: 6 },
      grooveSpacing: 0.8,
      holderHeight: 2.4, 
      holderTubeRadius: 0.04,
      holderSpacing: 0.4
    }
    
    // materials
    this.metalMaterial = new THREE.MeshStandardMaterial({
      metalness: 1.0,
      roughness: 0.2,
      color: 0xccccdd,
      emissive: 0x222233,
      emissiveIntensity: 0.1
    })

    this.rubberMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.0,
      roughness: 0.95,
      color: 0x1a1a1a
    })

    this.grooveMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      roughness: 1.0
    })

    this.tubeMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.8,
      roughness: 0.3,
      color: 0x8899aa
    })

    this.holderMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.9,
      roughness: 0.2,
      color: 0x99aabb,
      emissive: 0x112233,
      emissiveIntensity: 0.05
    })

    // Making conveyor components
    this.createConveyorPlate()
    this.createGrooves()
    this.createLegSystem()
    this.createHolderSystem()
  }

  // Making the conveyor belt plate (metal sides + rubber center)
  createConveyorPlate() {
    const { totalWidth, totalDepth, thickness, edgeSize } = this.config
    
    // Front and rear metal sides
    const edgeFBGeo = new THREE.BoxGeometry(totalWidth, thickness, edgeSize)
    
    const frontEdge = new THREE.Mesh(edgeFBGeo, this.metalMaterial)
    frontEdge.position.set(0, 2, 3 + totalDepth/2 - edgeSize/2)
    
    const backEdge = new THREE.Mesh(edgeFBGeo, this.metalMaterial)
    backEdge.position.set(0, 2, 3 - totalDepth/2 + edgeSize/2)
    
    // Left and right metal sides
    const edgeLRGeo = new THREE.BoxGeometry(edgeSize, thickness, totalDepth - edgeSize * 2)
    
    const leftEdge = new THREE.Mesh(edgeLRGeo, this.metalMaterial)
    leftEdge.position.set(-totalWidth/2 + edgeSize/2, 2, 3)
    
    const rightEdge = new THREE.Mesh(edgeLRGeo, this.metalMaterial)
    rightEdge.position.set(totalWidth/2 - edgeSize/2, 2, 3)
    
    // Middle part (rubber)
    const centerGeo = new THREE.BoxGeometry(
      totalWidth - edgeSize * 2,
      thickness,
      totalDepth - edgeSize * 2
    )
    const center = new THREE.Mesh(centerGeo, this.rubberMaterial)
    center.position.set(0, 2, 3)
    
    // Conveyor plate group
    const conveyorPlate = new THREE.Group()
    conveyorPlate.add(frontEdge, backEdge, leftEdge, rightEdge, center)
    conveyorPlate.name = 'Conveyor-Plate'
    this.add(conveyorPlate)
    
    this.conveyorPlate = conveyorPlate
  }

  // Create transverse grooves on the tire 
  createGrooves() {
    const { totalWidth, edgeSize, grooveSpacing } = this.config
    
    for (let x = -totalWidth/2 + edgeSize + 0.2; x <= totalWidth/2 - edgeSize - 0.2; x += grooveSpacing) {
      const groove = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.01, 1.3),
        this.grooveMaterial
      )
      groove.position.set(x, 2.16, 3)
      this.conveyorPlate.add(groove)
    }
  }

  // Build a base set (two front and rear bases + connecting tubes)  
  createBaseSet() {
    const group = new THREE.Group()
    const { legHeight, legRadius, legSpacingZ, tubeRadius } = this.config
    
    // Front base (positive Z)
    const legGeo = new THREE.CylinderGeometry(legRadius, legRadius , legHeight, 12)
    const frontLeg = new THREE.Mesh(legGeo, this.metalMaterial)
    frontLeg.castShadow = true
    frontLeg.receiveShadow = true
    frontLeg.position.set(0, legHeight/2, legSpacingZ/2)
    group.add(frontLeg)
    
    // Back leg (negative Z)
    const backLeg = new THREE.Mesh(legGeo.clone(), this.metalMaterial)
    backLeg.castShadow = true
    backLeg.receiveShadow = true
    backLeg.position.set(0, legHeight/2, -legSpacingZ/2)
    group.add(backLeg)
    
    // Front to back connecting pipes (along Z)
    const tubeGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, legSpacingZ * 0.9, 8)
    
    // Three pipes at different heights
    const heights = [0.3, 0.85]
    heights.forEach(height => {
      const tube = new THREE.Mesh(tubeGeo, this.metalMaterial)
      tube.castShadow = true
      tube.receiveShadow = true
      tube.rotation.x = Math.PI / 2
      tube.position.set(0, legHeight * height, 0)
      group.add(tube)
    })
    
    return group
  }

  // Create lateral longitudinal tubes (front and rear)
  createLongitudinalTubes() {
    const { legSpacingZ, centerZ, xRange, legHeight, baseSpacing } = this.config
    const startX = xRange.start
    const endX = xRange.end
    
    // Calculate the number of sections
    const numSegments = Math.floor((endX - startX) / baseSpacing)
    const segmentLength = (endX - startX) / numSegments * 0.85
    
    // Z positions for front and rear pipes
    const zPositions = [
      centerZ + legSpacingZ/2 + 0.1,
      centerZ - legSpacingZ/2 - 0.1
    ]
    
    // Different heights for pipes
    const heights = [legHeight * 1.2, legHeight * 1.3]
    
    zPositions.forEach(zPos => {
      heights.forEach(height => {
        for (let i = 0; i < numSegments; i++) {
          const xPos = startX + (i + 0.5) * segmentLength
          const tubeGeo = new THREE.CylinderGeometry(0.05, 0.05, segmentLength, 6)
          const tube = new THREE.Mesh(tubeGeo, this.metalMaterial)
          tube.rotation.z = Math.PI / 2
          tube.position.set(xPos, height, zPos)
          tube.castShadow = true
          this.add(tube)
        }
      })
    })
  }

  // Complete base system
  createLegSystem() {
    const { baseSpacing, centerZ, xRange } = this.config
    
    for (let x = xRange.start; x <= xRange.end; x += baseSpacing) {
      const baseSet = this.createBaseSet()
      baseSet.position.set(x, 0, centerZ)
      this.add(baseSet)
    }
    
    this.createLongitudinalTubes()
  }

  // Create a Holder collection
  createHolderSet() {
    const group = new THREE.Group()
    const { 
      legHeight, 
      legSpacingZ, 
      holderHeight
    } = this.config
    
    // Vertical holder legs (connecting to conveyor)
    const supportHeight = holderHeight - 1.8 
    const supportGeo = new THREE.CylinderGeometry(0.04, 0.05, supportHeight, 8)
    
    //Two vertical posts at the corners    
    const supportPositions = [
      { z: legSpacingZ/2 + 0.1, x: 0.15 },
      { z: -legSpacingZ/2 - 0.1, x: 0.15 }
    ]
    
    supportPositions.forEach(pos => {
      const support = new THREE.Mesh(supportGeo, this.rubberMaterial)
      support.position.set(pos.x, 2 + supportHeight/2, pos.z)
      support.castShadow = true
      group.add(support)
    })
  
    return group
  }

  // Complete Holder System
  createHolderSystem() {
    const { baseSpacing, centerZ, xRange } = this.config
    
    for (let x = xRange.start; x <= xRange.end; x += baseSpacing) {
      const holderSet = this.createHolderSet()
      holderSet.position.set(x, 0, centerZ)
      this.add(holderSet)
    }
  }

  // Method to change settings
  updateConfig(newConfig) {
    Object.assign(this.config, newConfig)
    while(this.children.length > 0) {
      this.remove(this.children[0])
    }
    this.createConveyorPlate()
    this.createGrooves()
    this.createLegSystem()
    this.createHolderSystem()
  }
}