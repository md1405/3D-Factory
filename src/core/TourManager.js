import * as THREE from 'three';
import { tourPoints } from '../factory/EquipmentData';

export class TourManager {
    constructor(camera, controls, scene) {
        this.camera = camera;
        this.controls = controls;
        this.scene = scene;
        
        this.isActive = false;
        this.currentPointIndex = 0;
        this.transitionSpeed = 0.03;
        this.isTransitioning = false;
        this.timer = null;
        
        // UI elements
        this.createUIElements();
    }

    createUIElements() {
        // Remove previous elements if they exist
        const existingInfo = document.getElementById('tour-info');
        const existingProgress = document.getElementById('tour-progress');
        if (existingInfo) existingInfo.remove();
        if (existingProgress) existingProgress.remove();

        // Create tour info container
        this.infoContainer = document.createElement('div');
        this.infoContainer.id = 'tour-info';
        this.infoContainer.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 15px 30px;
            border-radius: 12px;
            font-family: 'Arial', sans-serif;
            display: none;
            z-index: 1000;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            text-align: center;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;
        
        // Progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.id = 'tour-progress';
        this.progressBar.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            width: min(300px, 80%);
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            z-index: 1001;
            display: none;
            pointer-events: none;
        `;
        
        // Adjust position for mobile
        if (window.innerWidth <= 768) {
            this.progressBar.style.top = 'auto';
            this.progressBar.style.bottom = '100px';
        }        
        
        const progressFill = document.createElement('div');
        progressFill.id = 'progress-fill';
        progressFill.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            border-radius: 2px;
            transition: width 0.3s ease;
        `;
        
        this.progressBar.appendChild(progressFill);
        document.body.appendChild(this.progressBar);
        document.body.appendChild(this.infoContainer);
    }

    start() {
        if (!this.camera || !this.controls) {
            console.error('❌ Camera or controls not available');
            return;
        }

        this.isActive = true;
        this.currentPointIndex = 0;
        
        // Disable OrbitControls
        if (this.controls) {
            this.controls.enabled = false;
        }
        
        // Show UI
        this.showUI();
        
        console.log('🎯 Tour started');
        this.moveToNextPoint();
    }

    stop() {
        this.isActive = false;
        this.isTransitioning = false;
        
        // Re-enable OrbitControls
        if (this.controls) {
            this.controls.enabled = true;
        }
        
        // Hide UI
        this.hideUI();
        
        // Clear timer
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        console.log('🛑 Tour stopped');
    }

    showUI() {
        if (this.infoContainer) {
            this.infoContainer.style.display = 'block';
            this.infoContainer.style.opacity = '1';
        }
        if (this.progressBar) {
            this.progressBar.style.display = 'block';
        }
    }

    hideUI() {
        if (this.infoContainer) {
            this.infoContainer.style.display = 'none';
            this.infoContainer.style.opacity = '0';
        }
        if (this.progressBar) {
            this.progressBar.style.display = 'none';
        }
    }

    moveToNextPoint() {
        if (!this.isActive || this.currentPointIndex >= tourPoints.length) {
            // Tour has ended
            this.completeTour();
            return;
        }

        const point = tourPoints[this.currentPointIndex];
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const progress = (this.currentPointIndex / tourPoints.length) * 100;
            progressFill.style.width = `${progress}%`;
        }
        
        // Show current point information
        this.showPointInfo(point);
        
        // Smooth camera movement
        this.animateCamera(point, () => {
            // Wait for specified duration after reaching the point
            this.timer = setTimeout(() => {
                this.currentPointIndex++;
                this.moveToNextPoint();
            }, point.duration || 4000);
        });
    }

    completeTour() {
        // Deactivate tour without calling stop
        this.isActive = false;
        this.isTransitioning = false;
        
        // Re-enable OrbitControls
        if (this.controls) {
            this.controls.enabled = true;
        }
        
        // Clear timer
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        // Show completion message
        this.showCompletionMessage();
        
        // Reset buttons
        this.resetButtons();
        
        console.log('✅ Tour completed successfully');
    }

    animateCamera(point, onComplete) {
        if (!this.isActive) return;
        
        const targetPosition = new THREE.Vector3(...point.cameraPosition);
        const targetLookAt = new THREE.Vector3(...point.target);
        
        const animate = () => {
            if (!this.isActive) {
                return;
            }
            
            // Smooth camera movement
            this.camera.position.lerp(targetPosition, this.transitionSpeed);
            
            // Look at point movement
            if (this.controls && this.controls.target) {
                this.controls.target.lerp(targetLookAt, this.transitionSpeed);
                this.controls.update();
            }
            
            // Check if target reached
            const distance = this.camera.position.distanceTo(targetPosition);
            
            if (distance < 0.1) {
                // Target reached
                this.camera.position.copy(targetPosition);
                if (this.controls && this.controls.target) {
                    this.controls.target.copy(targetLookAt);
                    this.controls.update();
                }
                if (onComplete) onComplete();
            } else {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    showPointInfo(point) {
        if (!this.infoContainer) return;
        
        // Ensure container is visible
        this.infoContainer.style.display = 'block';
        this.infoContainer.style.opacity = '1';
        
        this.infoContainer.innerHTML = `
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">
                ${point.name}
            </div>
            ${point.description ? `
                <div style="font-size: 14px; font-weight: normal; margin-bottom: 5px; opacity: 0.8;">
                    ${point.description}
                </div>
            ` : ''}
        `;
    }

    showCompletionMessage() {
        if (!this.infoContainer) return;
        
        // Ensure container is visible
        this.infoContainer.style.display = 'block';
        this.infoContainer.style.opacity = '1';
        
        // Show success message
        this.infoContainer.innerHTML = `
            <div style="font-size: 18px; font-weight: bold; color: #4CAF50; margin-bottom: 5px;">
                ✅ Tour Completed Successfully
            </div>
        `;
        
        // Update progress bar to 100%
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = '100%';
        }
        
        // Hide after 3 seconds
        setTimeout(() => {
            this.hideUI();
        }, 3000);
    }

    resetButtons() {
        // Reset buttons to initial state
        const tourBtn = document.getElementById('tour-btn');
        const stopBtn = document.getElementById('stop-tour');
        
        if (tourBtn) {
            tourBtn.style.display = 'flex';
        }
        if (stopBtn) {
            stopBtn.style.display = 'none';
        }
    }
}