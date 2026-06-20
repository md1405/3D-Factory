import { Group, DirectionalLight, AmbientLight, Object3D, Vector3 } from 'three'

export default class Light extends Group {
  constructor(scene, color = 0xffffff, intensity = 3) {
    super()
    
    this.scene = scene;
    this.light1 = new DirectionalLight(color, intensity);
    this.customProperties = new Map();  
    this.disposed = false;
    
    this.light1.position.set(5, 8, 8);
    
    this.light1.target = new Object3D();
    this.light1.target.position.set(0, 0, 0);
    scene.add(this.light1.target); 
    
    this.light1.castShadow = true;
    this.light1.shadow.mapSize.width = 1024;
    this.light1.shadow.mapSize.height = 1024;
    this.light1.shadow.camera.left = -10;
    this.light1.shadow.camera.right = 10;
    this.light1.shadow.camera.top = 10;
    this.light1.shadow.camera.bottom = -10;
    this.light1.shadow.camera.near = 0.5;
    this.light1.shadow.camera.far = 50;
    
    this.add(this.light1);

    this.light2 = new AmbientLight(color, intensity=1);
    this.add(this.light2);
  }
  
  dispose() {
    if (this.disposed) return;
    
    if (this.light.shadow.map) {
      this.light.shadow.map.dispose();
    }
    
    if (this.light.target && this.light.target.parent) {
      this.light.target.parent.remove(this.light.target);
    }
    
    if (this.parent) {
      this.parent.remove(this);
    }
    
    this.light = null;
    this.customProperties.clear();
    this.disposed = true;
  }
  
  setWorldPosition(x, y, z) {
    const worldPos = new Vector3(x, y, z);
    this.light.position.copy(worldPos);
  }
  
  setCustomProperty(key, value) {
    const blockedKeys = ['__proto__', 'constructor', 'prototype'];
    if (blockedKeys.includes(key)) {
      console.error('Security: Attempt to set dangerous property "${key}" blocked');
      return;
    }
    this.customProperties.set(key, value);
  }
  
  getCustomProperty(key) {
    return this.customProperties.get(key);
  }
  
  updatePosition(x, y, z) {
    this.light.position.set(x, y, z);
    this.light.updateMatrix(); 
  }
}