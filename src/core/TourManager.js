import * as THREE from 'three';
import { tourPoints, equipmentData } from '../factory/EquipmentData';

export class TourManager {
    constructor(camera, controls, scene) {
        this.camera = camera;
        this.controls = controls;
        this.scene = scene;
        
        this.isActive = false;
        this.isPaused = false;
        this.currentPointIndex = 0;
        this.transitionSpeed = 0.03;
        this.timer = null;
        this.animationId = null;
        
        // Store equipment IDs in order
        this.equipmentIds = Object.keys(equipmentData);
        
        // Highlight tracking
        this.highlightColor = new THREE.Color(0x4a90e2);
        this.highlightIntensity = 0.4;
        this.highlightedMeshes = []; // Track currently highlighted meshes
        
        // Initialize UI
        this.initUI();
        this.buildEquipmentList();
        this.bindEvents();
    }

    initUI() {
        // Cache DOM elements
        this.defaultControls = document.getElementById('default-controls');
        this.tourControls = document.getElementById('tour-controls');
        this.stepIndicator = document.getElementById('step-indicator');
        this.tourInfo = document.getElementById('tour-info');
        this.equipmentPanel = document.getElementById('equipment-panel');
        this.hint = document.getElementById('hint');
        
        // Buttons
        this.btnStart = document.getElementById('tour-btn');
        this.btnPrev = document.getElementById('tour-prev');
        this.btnPause = document.getElementById('tour-pause');
        this.btnNext = document.getElementById('tour-next');
        this.btnStop = document.getElementById('tour-stop');
        this.btnReset = document.getElementById('reset-btn');
        
        // Step indicator elements
        this.stepText = document.getElementById('step-text');
        this.stepName = document.getElementById('step-name');
        
        // Status bar
        this.statusBar = document.getElementById('status-bar');
        this.statusDot = document.getElementById('status-dot');
        this.statusText = document.getElementById('status-text');
    }

    buildEquipmentList() {
        const list = document.getElementById('equipment-list');
        if (!list) return;
        
        list.innerHTML = '';
        
        tourPoints.forEach((point, index) => {
            const li = document.createElement('li');
            li.dataset.index = index;
            li.innerHTML = `
                <span class="equipment-number">${index + 1}</span>
                <span class="equipment-name">${point.name}</span>
            `;
            li.addEventListener('click', () => this.jumpToPoint(index));
            list.appendChild(li);
        });
    }

    bindEvents() {
        if (this.btnStart) {
            this.btnStart.addEventListener('click', () => this.start());
        }
        if (this.btnPrev) {
            this.btnPrev.addEventListener('click', () => this.previous());
        }
        if (this.btnPause) {
            this.btnPause.addEventListener('click', () => this.togglePause());
        }
        if (this.btnNext) {
            this.btnNext.addEventListener('click', () => this.next());
        }
        if (this.btnStop) {
            this.btnStop.addEventListener('click', () => this.stop());
        }
        if (this.btnReset) {
            this.btnReset.addEventListener('click', () => this.resetView());
        }
    }

    updateStatus(message, type = 'active') {
        if (!this.statusBar || !this.statusDot || !this.statusText) return;
        
        this.statusBar.classList.add('visible');
        this.statusDot.className = `status-dot ${type}`;
        this.statusText.textContent = message;
    }

    hideStatus() {
        if (this.statusBar) {
            this.statusBar.classList.remove('visible');
        }
    }

    // ==========================================
    // Emissive Highlight System
    // ==========================================
    
    /**
     * Finds all meshes belonging to an equipment by checking userData.equipmentId
     * on both the mesh itself and its parent chain up to scene level.
     */
    findMeshesByEquipmentId(equipmentId) {
        const meshes = [];
        
        this.scene.traverse((child) => {
            if (!child.isMesh) return;
            
            // Check mesh itself
            if (child.userData.equipmentId === equipmentId) {
                meshes.push(child);
                return;
            }
            
            // Check parent chain (but stop at scene or factory level)
            let current = child.parent;
            while (current && current !== this.scene) {
                if (current.userData.equipmentId === equipmentId) {
                    meshes.push(child);
                    break;
                }
                current = current.parent;
            }
        });
        
        return meshes;
    }

    /**
     * Highlights the specified equipment by applying emissive to all its meshes.
     * Automatically clears previous highlight first.
     */
    highlightEquipment3D(equipmentId) {
        // ALWAYS clear previous highlight first
        this.clearAllHighlights3D();
        
        if (!equipmentId) return;
        
        const meshes = this.findMeshesByEquipmentId(equipmentId);
        
        if (meshes.length === 0) {
            console.warn(`⚠️ No meshes found for equipment: ${equipmentId}`);
            return;
        }
        
        meshes.forEach(mesh => {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            
            materials.forEach(mat => {
                // Only process StandardMaterial or PhongMaterial
                if (!mat || mat.emissive === undefined) return;
                
                // Store original values (only if not already stored)
                if (mat._originalEmissive === undefined) {
                    mat._originalEmissive = mat.emissive.getHex();
                    mat._originalEmissiveIntensity = mat.emissiveIntensity !== undefined ? mat.emissiveIntensity : 0;
                }
                
                // Apply highlight
                mat.emissive.copy(this.highlightColor);
                mat.emissiveIntensity = this.highlightIntensity;
                mat.needsUpdate = true;
                
                // Track this material for cleanup
                if (!this.highlightedMeshes.includes(mat)) {
                    this.highlightedMeshes.push(mat);
                }
            });
        });
        
        console.log(`✨ Highlighted: ${equipmentId} (${meshes.length} meshes, ${this.highlightedMeshes.length} materials tracked)`);
    }

    /**
     * Restores ALL highlighted materials to their original state.
     * Uses tracked list for reliability.
     */
    clearAllHighlights3D() {
        // Method 1: Clear using tracked materials list
        this.highlightedMeshes.forEach(mat => {
            if (mat && mat._originalEmissive !== undefined) {
                mat.emissive.setHex(mat._originalEmissive);
                mat.emissiveIntensity = mat._originalEmissiveIntensity;
                mat.needsUpdate = true;
                
                delete mat._originalEmissive;
                delete mat._originalEmissiveIntensity;
            }
        });
        
        // Clear the tracked list
        this.highlightedMeshes = [];
        
        // Method 2: Safety net - traverse scene and clean any leftover highlights
        this.scene.traverse((child) => {
            if (!child.isMesh) return;
            
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            
            materials.forEach(mat => {
                if (mat && mat._originalEmissive !== undefined) {
                    mat.emissive.setHex(mat._originalEmissive);
                    mat.emissiveIntensity = mat._originalEmissiveIntensity;
                    mat.needsUpdate = true;
                    
                    delete mat._originalEmissive;
                    delete mat._originalEmissiveIntensity;
                }
            });
        });
        
        console.log('🧹 All 3D highlights cleared');
    }

    // ==========================================
    // Tour Controls
    // ==========================================

    start(fromIndex = 0) {
        if (!this.camera || !this.controls) {
            console.error('❌ Camera or controls not available');
            return;
        }

        // If already active, just jump to point
        if (this.isActive) {
            this.jumpToPoint(fromIndex);
            return;
        }

        this.isActive = true;
        this.isPaused = false;
        this.currentPointIndex = fromIndex;
        
        // Disable OrbitControls
        this.controls.enabled = false;
        
        // Toggle UI visibility
        this.defaultControls.style.display = 'none';
        this.tourControls.style.display = 'flex';
        this.stepIndicator.style.display = 'flex';
        this.tourInfo.style.display = 'block';
        if (this.hint) this.hint.style.display = 'none';
        
        // Update pause button
        this.btnPause.innerHTML = '<span class="btn-icon">⏸</span> Pause';
        this.btnPause.className = 'btn btn-primary';
        
        this.updateStatus('Tour Active', 'active');
        
        console.log('🎯 Tour started');
        this.moveToCurrentPoint();
    }

    stop() {
        this.isActive = false;
        this.isPaused = false;
        
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Re-enable OrbitControls
        this.controls.enabled = true;
        
        // Toggle UI
        this.defaultControls.style.display = 'flex';
        this.tourControls.style.display = 'none';
        this.stepIndicator.style.display = 'none';
        this.tourInfo.style.display = 'none';
        if (this.hint) this.hint.style.display = 'block';
        
        // 🧹 CLEAR ALL HIGHLIGHTS
        this.clearEquipmentHighlight();
        this.clearAllHighlights3D();
        
        
        this.hideStatus();
        
        console.log('🛑 Tour stopped - all highlights cleared');
    }

    togglePause() {
        if (!this.isActive) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.btnPause.innerHTML = '<span class="btn-icon">▶</span> Resume';
            this.btnPause.className = 'btn btn-success';
            
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            
            this.updateStatus('Tour Paused', 'completed');
        } else {
            this.btnPause.innerHTML = '<span class="btn-icon">⏸</span> Pause';
            this.btnPause.className = 'btn btn-primary';
            
            this.updateStatus('Tour Active', 'active');
            this.moveToCurrentPoint();
        }
    }

    next() {
        if (!this.isActive) return;
        
        this.clearTimerAndAnimation();
        
        if (this.currentPointIndex < tourPoints.length - 1) {
            this.currentPointIndex++;
            this.ensureNotPaused();
            this.moveToCurrentPoint();
        } else {
            this.completeTour();
        }
    }

    previous() {
        if (!this.isActive) return;
        
        this.clearTimerAndAnimation();
        
        if (this.currentPointIndex > 0) {
            this.currentPointIndex--;
            this.ensureNotPaused();
            this.moveToCurrentPoint();
        }
    }

    jumpToPoint(index) {
        if (index < 0 || index >= tourPoints.length) return;
        
        // If tour not active, start it
        if (!this.isActive) {
            this.start(index);
            return;
        }
        
        this.clearTimerAndAnimation();
        this.currentPointIndex = index;
        this.ensureNotPaused();
        this.moveToCurrentPoint();
    }

    clearTimerAndAnimation() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    ensureNotPaused() {
        if (this.isPaused) {
            this.isPaused = false;
            this.btnPause.innerHTML = '<span class="btn-icon">⏸</span> Pause';
            this.btnPause.className = 'btn btn-primary';
            this.updateStatus('Tour Active', 'active');
        }
    }

    moveToCurrentPoint() {
        if (!this.isActive || this.isPaused) return;
        if (this.currentPointIndex >= tourPoints.length) {
            this.completeTour();
            return;
        }

        const point = tourPoints[this.currentPointIndex];
        const equipId = this.equipmentIds[this.currentPointIndex];
        const equipData = equipmentData[equipId];
        
        // Update all UI
        this.updateStepIndicator(point);
        this.updateEquipmentHighlight();
        this.updateTourInfo(point, equipData);
        
        // 🎯 Highlight 3D equipment (this automatically clears previous)
        this.highlightEquipment3D(equipId);
        
        // Update status
        this.updateStatus(`Viewing: ${point.name}`, 'active');
        
        // Animate camera
        this.animateCamera(point, () => {
            if (!this.isActive || this.isPaused) return;
            
            this.timer = setTimeout(() => {
                if (!this.isActive || this.isPaused) return;
                
                if (this.currentPointIndex < tourPoints.length - 1) {
                    this.currentPointIndex++;
                    this.moveToCurrentPoint();
                } else {
                    this.completeTour();
                }
            }, point.duration || 4000);
        });
    }

    animateCamera(point, onComplete) {
        if (!this.isActive || this.isPaused) return;
        
        const targetPosition = new THREE.Vector3(...point.cameraPosition);
        const targetLookAt = new THREE.Vector3(...point.target);
        
        const animate = () => {
            if (!this.isActive || this.isPaused) {
                this.animationId = null;
                return;
            }
            
            this.camera.position.lerp(targetPosition, this.transitionSpeed);
            
            if (this.controls && this.controls.target) {
                this.controls.target.lerp(targetLookAt, this.transitionSpeed);
                this.controls.update();
            }
            
            const distance = this.camera.position.distanceTo(targetPosition);
            
            if (distance < 0.1) {
                this.camera.position.copy(targetPosition);
                if (this.controls && this.controls.target) {
                    this.controls.target.copy(targetLookAt);
                    this.controls.update();
                }
                this.animationId = null;
                if (onComplete) onComplete();
            } else {
                this.animationId = requestAnimationFrame(animate);
            }
        };
        
        this.animationId = requestAnimationFrame(animate);
    }

    updateStepIndicator(point) {
        if (!this.stepText || !this.stepName) return;
        this.stepText.textContent = `Step ${point.processStep || this.currentPointIndex + 1} / ${tourPoints.length}`;
        this.stepName.textContent = point.name;
    }

    updateEquipmentHighlight() {
        const items = document.querySelectorAll('#equipment-list li');
        items.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentPointIndex);
        });
    }

    clearEquipmentHighlight() {
        const items = document.querySelectorAll('#equipment-list li');
        items.forEach(item => item.classList.remove('active'));
    }

    updateTourInfo(point, equipData) {
        if (!this.tourInfo) return;
        
        let specsHTML = '';
        if (equipData?.info?.en?.specs) {
            specsHTML = '<div class="tour-info-specs">';
            equipData.info.en.specs.forEach(spec => {
                specsHTML += `<span>📋 ${spec.label}: <strong>${spec.value}</strong></span>`;
            });
            specsHTML += '</div>';
        }
        
        const description = equipData?.info?.en?.description || point.description || '';
        
        this.tourInfo.innerHTML = `
            <div class="tour-info-title">${point.name}</div>
            ${description ? `<div class="tour-info-desc">${description}</div>` : ''}
            ${specsHTML}
        `;
        this.tourInfo.style.display = 'block';
    }

    completeTour() {
        this.isActive = false;
        this.isPaused = false;
        
        this.clearTimerAndAnimation();
        
        this.controls.enabled = true;
        
        // 🧹 CLEAR ALL HIGHLIGHTS
        this.clearAllHighlights3D();
        this.clearEquipmentHighlight();
        
        // Show completion in tour-info
        if (this.tourInfo) {
            this.tourInfo.innerHTML = `
                <div class="tour-info-title" style="color: #4CAF50;">✅ Tour Completed</div>
                <div class="tour-info-desc">All equipment has been reviewed.</div>
            `;
        }
        
        this.updateStatus('Tour Completed', 'completed');
        
        
        // Reset everything after 3 seconds
        setTimeout(() => {
            this.defaultControls.style.display = 'flex';
            this.tourControls.style.display = 'none';
            this.stepIndicator.style.display = 'none';
            this.tourInfo.style.display = 'none';
            if (this.hint) this.hint.style.display = 'block';
            this.hideStatus();
        }, 3000);
        
        console.log('✅ Tour completed - all highlights cleared');
    }

    resetView() {
        if (this.isActive) {
            this.stop();
        }
        
        const defaultPos = new THREE.Vector3(5.8, 5.7, 10.8);
        const defaultTarget = new THREE.Vector3(0, 2, 0);
        
        const animateReset = () => {
            this.camera.position.lerp(defaultPos, 0.05);
            if (this.controls) {
                this.controls.target.lerp(defaultTarget, 0.05);
                this.controls.update();
            }
            
            if (this.camera.position.distanceTo(defaultPos) > 0.1) {
                requestAnimationFrame(animateReset);
            }
        };
        
        animateReset();
        console.log('🔄 View reset');
    }
}