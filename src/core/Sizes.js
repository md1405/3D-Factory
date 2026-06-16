import EventEmitter from '../utils/EventEmitter'


export default class Sizes extends EventEmitter {
  constructor() {
    super()
    
    if (typeof window === 'undefined') {
      this.width = 1920; 
      this.height = 1080;
      return
    }
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.rafId = null;
    this._resizeHandler = this._handleResize.bind(this);
    
    window.addEventListener('resize', this._resizeHandler);
  }
  
  _handleResize() {
    if (this.rafId) return;
    
    this.rafId = requestAnimationFrame(() => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      
      const safeWidth = Math.max(this.width, 1);
      const safeHeight = Math.max(this.height, 1);
      
      if (safeWidth !== this.width || safeHeight !== this.height) {
        console.warn('Window size was zero, using safe defaults');
      }
      
      this.emit('resize');
      this.rafId = null;
    })
  }
  
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this._resizeHandler);
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.removeAllListeners();
  }
}