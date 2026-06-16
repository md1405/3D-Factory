import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera {
  constructor(sizes, canvas) {
    this.sizes = sizes;
    this.canvas = canvas;
    this.instance = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    )
    this.instance.position.set(6, 5, 10);
    this.instance.lookAt(0, 0, 0);
    
    this.controls = new OrbitControls(this.instance, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 2, 0);
  }
  
  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }
  
  update() {
    this.controls.update();
  }
  
  dispose() {
    this.controls.dispose();
  }
}