import EventEmitter from '../utils/EventEmitter'

export default class Time extends EventEmitter {
  constructor() {
    super()
    this.current = performance.now();
    this.elapsed = 0;
    this.rafId = null;  

    this.tick = this.tick.bind(this);
    
    this.start();
  }
  
  start() {
    if (this.rafId) return;  
    this.rafId = requestAnimationFrame(this.tick);
  }
  
  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  tick() {
    const now = performance.now();  
    
    this.elapsed = now - this.current;
    this.current = now;

    this.emit('tick', this.elapsed);
    
    this.rafId = requestAnimationFrame(this.tick);
  }
  
  destroy() {
    this.stop();
    this.removeAllListeners();
  }
}
