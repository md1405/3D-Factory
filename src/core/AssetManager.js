import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';


export default class AssetManager {
    constructor() {
        this._pendingRejects = new Map();
        
        this.manager = new THREE.LoadingManager();
        this.assets = {
            models: {},
            textures: {},
            audio: {},
            hdr: {},
        };

        this.textureLoader = new THREE.TextureLoader(this.manager);
        this.gltfLoader = new GLTFLoader(this.manager);
        this.audioLoader = new THREE.AudioLoader(this.manager);
        this.hdrLoader = new HDRLoader(this.manager);
        this.hdrLoader.setDataType(THREE.HalfFloatType);

        // عناصر UI برای نمایش progress
        this.loadingScreen = document.getElementById('loading-screen');
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text');

        this.setupManagerEvents();
    }

    setupManagerEvents() {
        this.manager.onStart = (url, loaded, total) => {
            console.log(`🚀 Starting: ${url} (${loaded}/${total})`);
            this.updateUI(0);
        };

        this.manager.onProgress = (url, loaded, total) => {
            const progress = (loaded / total) * 100;
            console.log(`⏳ ${progress.toFixed(2)}% - ${url}`);
            this.updateUI(progress);
        };

        this.manager.onLoad = () => {
            console.log("✅ LoadingManager: All files have been reported.");
            this.hideLoadingScreen();
        };

        this.manager.onError = (url) => {
            console.error(`❌ LoadingManager error at: ${url}`);
            this.showError(`Failed to load: ${url}`);
            
            if (this._pendingRejects.has(url)) {
                const reject = this._pendingRejects.get(url);
                reject(new Error(`File loading failed: ${url}`));
                this._pendingRejects.delete(url);
            }
        };
    }

    // نمایش loading screen
    showLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.remove('hidden');
        }
    }

    // مخفی کردن loading screen
    hideLoadingScreen() {
        if (this.loadingScreen) {
            // کمی تاخیر برای نمایش 100%
            setTimeout(() => {
                this.loadingScreen.classList.add('hidden');
            }, 500);
        }
    }

    // نمایش خطا
    showError(message) {
        if (this.progressText) {
            this.progressText.textContent = message;
            this.progressText.style.color = '#ff4444';
        }
    }

    _trackedLoad(loader, url) {
        return new Promise((resolve, reject) => {
            this._pendingRejects.set(url, reject);
            
            if (loader instanceof HDRLoader) {
                loader.load(
                    url,
                    (texture) => {
                        this._pendingRejects.delete(url);
                        resolve(texture);
                    },
                    undefined,
                    (error) => {
                        this._pendingRejects.delete(url);
                        reject(error);
                    }
                );
            } else {
                loader.loadAsync(url)
                    .then((result) => {
                        this._pendingRejects.delete(url);
                        resolve(result);
                    })
                    .catch((error) => {
                        this._pendingRejects.delete(url);
                        reject(error);
                    });
            }
        });
    }

    async loadTexture(name, url, isColor = true) {
        const texture = await this._trackedLoad(this.textureLoader, url);
        texture.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        this.assets.textures[name] = texture;
        console.log(`   ✅ Texture '${name}' ready.`);
        return texture;
    }

    async loadModel(name, url) {
        const gltf = await this._trackedLoad(this.gltfLoader, url);
        this.assets.models[name] = gltf.scene;
        this.assets.animations = this.assets.animations || {};
        this.assets.animations[name] = gltf.animations;
        console.log(`   ✅ Model '${name}' ready with ${gltf.animations?.length || 0} animations.`);
        return gltf;
    }
    async loadOBJModel(name, url) {
        const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
        const objLoader = new OBJLoader(this.manager);
        
        const objGroup = await this._trackedLoad(objLoader, url);
        this.assets.models[name] = objGroup;
        console.log(`   ✅ OBJ Model '${name}' ready.`);
        return objGroup;
    }
    async loadAudio(name, url) {
        const buffer = await this._trackedLoad(this.audioLoader, url);
        this.assets.audio[name] = buffer;
        console.log(`   ✅ Audio '${name}' ready.`);
        return buffer;
    }

    async loadHDR(name, url) {
        const texture = await this._trackedLoad(this.hdrLoader, url);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.assets.hdr[name] = texture;
        console.log(`   ✅ HDR '${name}' ready.`);
        return texture;
    }

    setEnvironmentMap(hdrName, scene, options = {}) {
        const hdrTexture = this.assets.hdr[hdrName];
        if (!hdrTexture) {
            console.error(`HDR '${hdrName}' not found!`);
            return;
        }

        if (options.background !== false) {
            scene.background = hdrTexture;
        }
        scene.environment = hdrTexture;
        
        if (options.intensity !== undefined) {
            scene.environmentIntensity = options.intensity;
        }
        
        console.log(`🌍 Environment map '${hdrName}' applied to scene.`);
    }

    disposeModel(name) {
        const model = this.assets.models[name];
        if (!model) return;

        model.traverse((child) => {
            if (child.isMesh) {
                child.geometry?.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => this._disposeMaterial(mat));
                } else {
                    this._disposeMaterial(child.material);
                }
            }
        });
        delete this.assets.models[name];
        console.log(`🗑️ Model '${name}' disposed.`);
    }   

    disposeTexture(name) {
        const texture = this.assets.textures[name];
        if (texture) {
            texture.dispose();
            delete this.assets.textures[name];
            console.log(`🗑️ Texture '${name}' disposed.`);
        }
    }

    disposeHDR(name) {
        const hdr = this.assets.hdr[name];
        if (hdr) {
            hdr.dispose();
            delete this.assets.hdr[name];
            console.log(`🗑️ HDR '${name}' disposed.`);
        }
    }

    disposeAll() {
        Object.keys(this.assets.textures).forEach(name => this.disposeTexture(name));
        Object.keys(this.assets.hdr).forEach(name => this.disposeHDR(name));
        Object.keys(this.assets.models).forEach(name => this.disposeModel(name));
        this.assets.audio = {};
        console.log('🗑️ All assets disposed.');
    }

    _disposeMaterial(material) {
        if (!material) return;
        material.map?.dispose();
        material.normalMap?.dispose();
        material.roughnessMap?.dispose();
        material.metalnessMap?.dispose();
        material.aoMap?.dispose();
        material.dispose();
    }

    updateUI(progress) {
        if (this.progressBar) {
            this.progressBar.style.width = `${progress}%`;
        }
        if (this.progressText) {
            this.progressText.textContent = `${Math.round(progress)}%`;
        }
        console.log(`UI Progress: ${Math.round(progress)}%`);
    }
}