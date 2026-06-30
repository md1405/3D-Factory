// src/core/TourManager.js
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
        // Delete previous elements if they exist.
        const existingInfo = document.getElementById('tour-info');
        const existingProgress = document.getElementById('tour-progress');
        if (existingInfo) existingInfo.remove();
        if (existingProgress) existingProgress.remove();

        // Create a Tor data container
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
        `;
        
        // Progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.id = 'tour-progress';
        this.progressBar.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            z-index: 1000;
            display: none;
        `;
        
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
        
        // UI display
        this.infoContainer.style.display = 'block';
        this.progressBar.style.display = 'block';
        
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
        this.infoContainer.style.display = 'none';
        this.progressBar.style.display = 'none';
        
        // Clear timer
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        
        console.log('🛑 Tour stopped');
    }

    moveToNextPoint() {
        if (!this.isActive || this.currentPointIndex >= tourPoints.length) {
            this.stop();
            this.showCompletionMessage();
            return;
        }

        const point = tourPoints[this.currentPointIndex];
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const progress = (this.currentPointIndex / tourPoints.length) * 100;
            progressFill.style.width = `${progress}%`;
        }
        
        // Show point information
        this.showPointInfo(point);
        
        // Smooth camera movement
        this.animateCamera(point, () => {
            this.timer = setTimeout(() => {
                this.currentPointIndex++;
                this.moveToNextPoint();
            }, point.duration || 4000);
        });
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
            
            // Gaze point movement
            if (this.controls && this.controls.target) {
                this.controls.target.lerp(targetLookAt, this.transitionSpeed);
                this.controls.update();
            }
            
            // Checking goal achievement
            const distance = this.camera.position.distanceTo(targetPosition);
            
            if (distance < 0.1) {
                // goal achievement  
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
        
        this.infoContainer.innerHTML = `
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">
                ${point.name}
            </div>
            <!-- <div style="font-size: 14px; font-weight: normal; margin-bottom: 5px;">
                ${point.description}
            </div> -->
        `;
        
        this.infoContainer.style.opacity = '1';
    }

    showCompletionMessage() {
        if (!this.infoContainer) return;
        
        this.infoContainer.innerHTML = `
            <div style="font-size: 14px; opacity: 0.8;">
                Tour Completed Successfully
            </div>
        `;
        this.infoContainer.style.display = 'block';
        
        //  Hide after 3 seconds
        setTimeout(() => {
            if (this.infoContainer) {
                this.infoContainer.style.display = 'none';
            }
            const progressFill = document.getElementById('progress-fill');
            if (progressFill) {
                progressFill.style.width = '100%';
            }
            setTimeout(() => {
                if (this.progressBar) {
                    this.progressBar.style.display = 'none';
                }
            }, 500);
        }, 3000);
    }
}