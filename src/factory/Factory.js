import * as THREE from 'three'

export default class Factory extends THREE.Group {
  constructor() {
    super()

    this.name = 'Factory';
  }

  addMachine(machine) {
    this.add(machine);    
  }
}