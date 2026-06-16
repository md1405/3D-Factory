export default class EventEmitter {
  constructor() {
    this.events = new Map();
    this._maxListeners = 10;
  }

  on(event, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }
    
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    const listeners = this.events.get(event);
    
    if (listeners.size >= this._maxListeners) {
      const warning = `Possible EventEmitter memory leak detected. ${listeners.size} ${event} listeners added. Use emitter.setMaxListeners() to increase limit`;
      console.warn(warning);
    }
    
    listeners.add(callback);
    return this;
  }

  emit(event, ...args) {
    if (!this.events.has(event)) return false;
    
    const listeners = Array.from(this.events.get(event));
    for (const listener of listeners) {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
        if (event !== 'error') {
          this.emit('error', error);
        }
      }
    }
    return true;
  }

  off(event, callback) {
    if (!this.events.has(event)) return this;
    
    const listeners = this.events.get(event);
    listeners.delete(callback);
    
    if (listeners.size === 0) {
      this.events.delete(event);
    }
    return this;
  }
  
  once(event, callback) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      callback(...args);
    };
    return this.on(event, wrapper);
  }
  
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }
  
  setMaxListeners(n) {
    this._maxListeners = n;
    return this;
  }
}