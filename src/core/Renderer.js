import * as THREE from 'three'

export default class Renderer {
  constructor(canvas, scene, camera) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.scene = scene;
    this.camera = camera;
    this.resize()
  }

  resize() {
    if (window.innerWidth === 0 || window.innerHeight === 0) return;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
  }

  update() {
    this.renderer.render(this.scene, this.camera.instance);
  }
}
