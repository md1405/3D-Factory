import * as THREE from 'three';

export class LayoutManager {
    constructor(scene, factory) {
        this.scene = scene;
        this.factory = factory;
        
        // Layout state
        this.currentLayout = 'linear';
        this.gap = 2.0;
        this.gridSize = 1;
        this.snapEnabled = true;
        
        // Floor plan overlay
        this.floorPlan = null;
        this.gridHelper = null;
        
        // Equipment references
        this.equipmentRefs = {};

        this.defaultPositions = {};
        this.defaultRotations = {};
        
        // Layout presets with position offsets
        this.layouts = {
            linear: {
                name: 'Linear',
                icon: '━',
                positions: {
                    tank1: { x: -6, y: 3.5, z: 6 },
                    tank2: { x: -6, y: 3.5, z: 0 },
                    conveyor: { x: 0, y: -0.5, z: -1 }
                },
                rotations: {
                    conveyor: { x: 0, y: Math.PI / 2, z: 0 }
                }
            },
            'l-shape': {
                name: 'L-Shape',
                icon: '└',
                positions: {
                    tank1: { x: -6, y: 3.5, z: 6 },
                    tank2: { x: 0, y: 3.5, z: 6 },
                    conveyor: { x: 4, y: -0.5, z: -1 }
                },
                rotations: {
                    conveyor: { x: 0, y: Math.PI / 2, z: 0 }
                }
            },
            'u-shape': {
                name: 'U-Shape',
                icon: '⊔',
                positions: {
                    tank1: { x: -6, y: 3.5, z: 6 },
                    tank2: { x: 6, y: 3.5, z: 6 },
                    conveyor: { x: 0, y: -0.5, z: -4 }
                },
                rotations: {
                    conveyor: { x: 0, y: Math.PI / 2, z: 0 }
                }
            }
        };
        
        // Initialize
        this.initUI();
        this.createFloorPlan();
        this.createGrid();
    }
    
    // ==================== UI ====================
    initUI() {
        const panel = document.createElement('div');
        panel.id = 'layout-panel';
        panel.innerHTML = `
            <div class="layout-panel-header">
                <span>🏗️ Layout Configurator</span>
                <button id="layout-close-btn">✕</button>
            </div>
            <div class="layout-section">
                <div class="layout-section-title">Layout Presets</div>
                <div id="layout-presets" class="layout-presets">
                    <button class="layout-preset-btn active" data-layout="linear">
                        <span class="layout-icon">━</span>
                        <span>Linear</span>
                    </button>
                    <button class="layout-preset-btn" data-layout="l-shape">
                        <span class="layout-icon">└</span>
                        <span>L-Shape</span>
                    </button>
                    <button class="layout-preset-btn" data-layout="u-shape">
                        <span class="layout-icon">⊔</span>
                        <span>U-Shape</span>
                    </button>
                </div>
            </div>
            <div class="layout-section">
                <div class="layout-section-title">
                    Gap Between Equipment
                    <span id="gap-value">2.0m</span>
                </div>
                <input type="range" id="gap-slider" min="1" max="5" step="0.5" value="2">
            </div>
            <div class="layout-section">
                <label class="layout-checkbox">
                    <input type="checkbox" id="snap-toggle" checked>
                    <span>Snap to Grid (1m × 1m)</span>
                </label>
            </div>
            <div class="layout-section">
                <label class="layout-checkbox">
                    <input type="checkbox" id="floorplan-toggle" checked>
                    <span>Show Floor Plan Overlay</span>
                </label>
            </div>
            <div class="layout-section">
                <button id="reset-layout-btn" class="btn-reset-layout">
                    🔄 Reset to Default
                </button>
            </div>
            <div id="layout-info" class="layout-info">
                <div>📐 Floor: 22m × 22m</div>
                <div>📏 Grid: 1m × 1m</div>
                <div>🏭 Equipment: ${Object.keys(this.equipmentRefs).length} items</div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Add styles
        this.addStyles();
        
        // Bind events
        this.bindEvents();
        
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #layout-panel {
                position: fixed;
                top: 80px;
                left: 30px;
                width: 280px;
                background: rgba(26, 31, 46, 0.95);
                backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                z-index: 996;
                display: none;
                flex-direction: column;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            #layout-panel.visible {
                display: flex;
            }
            
            .layout-panel-header {
                padding: 16px 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 14px;
                font-weight: 700;
                color: #ffffff;
            }
            
            #layout-close-btn {
                background: none;
                border: none;
                color: #64748b;
                cursor: pointer;
                font-size: 16px;
                padding: 4px;
                transition: color 0.2s;
            }
            
            #layout-close-btn:hover {
                color: #ffffff;
            }
            
            .layout-section {
                padding: 16px 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            }
            
            .layout-section-title {
                font-size: 11px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 12px;
                font-weight: 600;
                display: flex;
                justify-content: space-between;
            }
            
            #gap-value {
                color: #4a90e2;
                font-weight: 700;
            }
            
            .layout-presets {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 8px;
            }
            
            .layout-preset-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                padding: 12px 8px;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 8px;
                color: #94a3b8;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .layout-preset-btn:hover {
                background: rgba(74, 144, 226, 0.1);
                border-color: rgba(74, 144, 226, 0.3);
                color: #ffffff;
                transform: translateY(-1px);
            }
            
            .layout-preset-btn.active {
                background: rgba(74, 144, 226, 0.2);
                border-color: #4a90e2;
                color: #ffffff;
                font-weight: 600;
                box-shadow: 0 0 15px rgba(74, 144, 226, 0.2);
            }
            
            .layout-icon {
                font-size: 20px;
            }
            
            #gap-slider {
                width: 100%;
                accent-color: #4a90e2;
                margin-top: 8px;
                cursor: pointer;
            }
            
            .layout-checkbox {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 13px;
                color: #c0ccda;
                cursor: pointer;
                padding: 4px 0;
            }
            
            .layout-checkbox input {
                accent-color: #4a90e2;
                cursor: pointer;
            }
            
            .btn-reset-layout {
                width: 100%;
                padding: 10px;
                background: rgba(245, 87, 108, 0.1);
                border: 1px solid rgba(245, 87, 108, 0.3);
                border-radius: 6px;
                color: #f5576c;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .btn-reset-layout:hover {
                background: rgba(245, 87, 108, 0.2);
            }
            
            .layout-info {
                padding: 16px 20px;
                font-size: 12px;
                color: #64748b;
                line-height: 1.8;
            }
            
            @media (max-width: 768px) {
                #layout-panel {
                    left: 10px;
                    width: calc(100vw - 20px);
                    max-height: 60vh;
                    overflow-y: auto;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    bindEvents() {
        // Layout preset buttons
        document.querySelectorAll('.layout-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const layout = btn.dataset.layout;
                this.setLayout(layout);
                
                // Play click sound if available
                this.playClickFeedback();
            });
        });
        
        // Gap slider
        const gapSlider = document.getElementById('gap-slider');
        const gapValue = document.getElementById('gap-value');
        if (gapSlider && gapValue) {
            gapSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                gapValue.textContent = value.toFixed(1) + 'm';
            });
            
            gapSlider.addEventListener('change', (e) => {
                const value = parseFloat(e.target.value);
                this.setGap(value);
            });
        }
        
        // Snap toggle
        const snapToggle = document.getElementById('snap-toggle');
        if (snapToggle) {
            snapToggle.addEventListener('change', (e) => {
                this.snapEnabled = e.target.checked;
                this.applyCurrentLayout();
                console.log(`📏 Snap to grid: ${this.snapEnabled ? 'ON' : 'OFF'}`);
            });
        }
        
        // Floor plan toggle
        const floorplanToggle = document.getElementById('floorplan-toggle');
        if (floorplanToggle) {
            floorplanToggle.addEventListener('change', (e) => {
                if (this.floorPlan) {
                    this.floorPlan.visible = e.target.checked;
                }
                if (this.gridHelper) {
                    this.gridHelper.visible = e.target.checked;
                }
            });
        }
        
        // Reset button
        const resetBtn = document.getElementById('reset-layout-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetToDefault();
            });
        }

        // Layout toggle button (دکمه توی HTML هست)
        const layoutToggleBtn = document.getElementById('layout-toggle-btn');
        if (layoutToggleBtn) {
            layoutToggleBtn.addEventListener('click', () => {
                const panel = document.getElementById('layout-panel');
                if (panel) {
                    panel.classList.toggle('visible');
                }
            });
        }        
        
        // Close button
        const closeBtn = document.getElementById('layout-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('layout-panel').classList.remove('visible');
            });
        }
    }
    
    
    // ==================== Floor Plan Overlay ====================
    createFloorPlan() {
        // Semi-transparent floor plan
        const floorPlanGeo = new THREE.PlaneGeometry(21.8, 21.8);
        const floorPlanMat = new THREE.MeshBasicMaterial({
            color: 0x4a90e2,
            transparent: true,
            opacity: 0.08,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        this.floorPlan = new THREE.Mesh(floorPlanGeo, floorPlanMat);
        this.floorPlan.rotation.x = -Math.PI / 2;
        this.floorPlan.position.y = 0.02;
        this.floorPlan.name = 'FloorPlan';
        this.floorPlan.renderOrder = 1;
        
        // Border
        const edgesGeo = new THREE.EdgesGeometry(floorPlanGeo);
        const edgesMat = new THREE.LineBasicMaterial({ 
            color: 0x4a90e2,
            transparent: true,
            opacity: 0.3,
            depthTest: false
        });
        const border = new THREE.LineSegments(edgesGeo, edgesMat);
        border.rotation.x = -Math.PI / 2;
        border.position.y = 0.03;
        border.renderOrder = 2;
        this.floorPlan.add(border);
        
        // Corner markers
        this.addCornerMarkers();
    }
    
    addCornerMarkers() {
        const markerMat = new THREE.MeshBasicMaterial({
            color: 0x4a90e2,
            transparent: true,
            opacity: 0.6
        });
        
        const halfSize = 10.9;
        const corners = [
            [-halfSize, halfSize],
            [halfSize, halfSize],
            [halfSize, -halfSize],
            [-halfSize, -halfSize]
        ];
        
        corners.forEach(([x, z]) => {
            const marker = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, 0.5, 8),
                markerMat
            );
            marker.position.set(x, 0.25, z);
            marker.renderOrder = 3;
            this.floorPlan.add(marker);
        });
    }
    
    createGrid() {
        this.gridHelper = new THREE.GridHelper(22, 22, 0x4a90e2, 0x4a90e2);
        this.gridHelper.position.y = 0.03;
        this.gridHelper.material.opacity = 0.12;
        this.gridHelper.material.transparent = true;
        this.gridHelper.material.depthTest = false;
        this.gridHelper.renderOrder = 0;
    }
    
    // ==================== Core Logic ====================
    registerEquipment(id, mesh) {
        this.equipmentRefs[id] = mesh;
        
        // ✅ ذخیره موقعیت و چرخش اصلی
        this.defaultPositions[id] = mesh.position.clone();
        this.defaultRotations[id] = mesh.rotation.clone();
        
        console.log(`✅ Registered equipment: ${id}`, 
            'pos:', this.defaultPositions[id].toArray().map(v => v.toFixed(1)));
    }
    
    setup(scene) {
        scene.add(this.floorPlan);
        scene.add(this.gridHelper);
        console.log('🏗️ LayoutManager setup complete');
    }
    
    setLayout(layoutType) {
        if (!this.layouts[layoutType]) {
            console.warn(`⚠️ Layout "${layoutType}" not found`);
            return;
        }
        
        this.currentLayout = layoutType;
        this.applyCurrentLayout();
        
        // Update UI
        document.querySelectorAll('.layout-preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.layout === layoutType);
        });
        
        console.log(`🏗️ Layout changed to: ${layoutType}`);
    }
    
    applyCurrentLayout() {
        const layout = this.layouts[this.currentLayout];
        if (!layout) return;
        
        // Apply positions with gap factor
        Object.entries(layout.positions).forEach(([equipId, pos]) => {
            const mesh = this.equipmentRefs[equipId];
            if (!mesh) {
                console.warn(`⚠️ Equipment "${equipId}" not registered`);
                return;
            }
            
            // Calculate position with gap
            let finalX = pos.x * (this.gap / 2);
            let finalZ = pos.z * (this.gap / 2);
            
            // Snap to grid if enabled
            if (this.snapEnabled) {
                finalX = Math.round(finalX / this.gridSize) * this.gridSize;
                finalZ = Math.round(finalZ / this.gridSize) * this.gridSize;
            }
            
            // Animate to new position
            this.animateToPosition(mesh, new THREE.Vector3(finalX, pos.y, finalZ));
        });
        
        // Apply rotations if defined
        if (layout.rotations) {
            Object.entries(layout.rotations).forEach(([equipId, rot]) => {
                const mesh = this.equipmentRefs[equipId];
                if (mesh) {
                    this.animateToRotation(mesh, new THREE.Euler(rot.x, rot.y, rot.z));
                }
            });
        }
        
        // Update pipe between tanks
        this.updatePipe();
        
        // Update conveyor-connected items
        this.updateConveyor();
    }
    
    setGap(value) {
        this.gap = value;
        const gapDisplay = document.getElementById('gap-value');
        if (gapDisplay) {
            gapDisplay.textContent = value.toFixed(1) + 'm';
        }
        this.applyCurrentLayout();
        console.log(`📏 Gap set to: ${value}m`);
    }
    
    animateToPosition(mesh, targetPos, duration = 800) {
        const startPos = mesh.position.clone();
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease in-out cubic
            const eased = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            mesh.position.lerpVectors(startPos, targetPos, eased);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                mesh.position.copy(targetPos);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    animateToRotation(mesh, targetRot, duration = 800) {
        const startRot = mesh.rotation.clone();
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const eased = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            mesh.rotation.x = startRot.x + (targetRot.x - startRot.x) * eased;
            mesh.rotation.y = startRot.y + (targetRot.y - startRot.y) * eased;
            mesh.rotation.z = startRot.z + (targetRot.z - startRot.z) * eased;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                mesh.rotation.copy(targetRot);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    updatePipe() {
        const tank1 = this.equipmentRefs['tank1'];
        const tank2 = this.equipmentRefs['tank2'];
        const pipe = this.equipmentRefs['pipe'];
        
        if (!tank1 || !tank2 || !pipe) return;
        
        // محاسبه فاصله و نقطه میانی
        const distance = tank1.position.distanceTo(tank2.position);
        
        const midPoint = new THREE.Vector3().addVectors(
            tank1.position.clone(),
            tank2.position.clone()
        ).multiplyScalar(0.5);
        
        // ارتفاع لوله: همون ارتفاع پیش‌فرض (توی Pipe.js: position.y = 3)
        const pipeY = this.defaultPositions['pipe'] 
            ? this.defaultPositions['pipe'].y 
            : 3;
        
        pipe.position.set(midPoint.x, pipeY, midPoint.z);
        
        // جهت از tank1 به tank2
        const direction = new THREE.Vector3().subVectors(
            tank2.position.clone(),
            tank1.position.clone()
        );
        
        // ✅ محاسبه زاویه حول محور Y
        const angleY = Math.atan2(direction.x, direction.z);
        
        // ✅ تنظیم rotation: 
        // - X = PI/2 (لوله افقی باشه - همونطور که توی Pipe.js هست)
        // - Y = زاویه بین دو تانک
        // - Z = 0
        pipe.rotation.set(Math.PI / 2, angleY, 0);
        
        // تنظیم مقیاس طول لوله
        const defaultPipeLength = 6;
        pipe.scale.set(1, distance / defaultPipeLength, 1);
        
        console.log(`🔧 Pipe: distance=${distance.toFixed(1)}m, angleY=${(angleY * 180 / Math.PI).toFixed(1)}°`);
    }
    
    moveEquipment(equipId, position) {
        const mesh = this.equipmentRefs[equipId];
        if (!mesh) {
            console.warn(`⚠️ Equipment "${equipId}" not found`);
            return;
        }
        
        if (this.snapEnabled) {
            position.x = Math.round(position.x / this.gridSize) * this.gridSize;
            position.z = Math.round(position.z / this.gridSize) * this.gridSize;
        }
        
        this.animateToPosition(mesh, position);
        
        // Update dependent items
        if (equipId === 'tank1' || equipId === 'tank2') {
            this.updatePipe();
        }
        if (equipId === 'conveyor') {
            this.updateConveyor();
        }
    }
    
    resetToDefault() {
        this.currentLayout = 'linear';
        this.gap = 2.0;
        this.snapEnabled = true;
        
        // Reset UI
        const gapSlider = document.getElementById('gap-slider');
        const gapValue = document.getElementById('gap-value');
        const snapToggle = document.getElementById('snap-toggle');
        
        if (gapSlider) gapSlider.value = 2;
        if (gapValue) gapValue.textContent = '2.0m';
        if (snapToggle) snapToggle.checked = true;
        
        // Reset presets UI
        document.querySelectorAll('.layout-preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.layout === 'linear');
        });
        
        // ✅ برگردوندن همه تجهیزات به موقعیت اصلی
        Object.entries(this.equipmentRefs).forEach(([id, mesh]) => {
            if (this.defaultPositions[id]) {
                this.animateToPosition(mesh, this.defaultPositions[id].clone());
            }
            if (this.defaultRotations[id]) {
                this.animateToRotation(mesh, this.defaultRotations[id].clone());
            }
        });
        
        // ✅ این مهمه: بعد از انیمیشن، صبر کن تا تموم بشه بعد pipe رو آپدیت کن
        setTimeout(() => {
            this.updatePipe();
            this.updateConveyor();
            console.log('🔄 Layout reset complete - pipe & conveyor updated');
        }, 900); // کمی بیشتر از duration انیمیشن (800ms)
        
        console.log('🔄 Layout reset to default');
    }
    
    playClickFeedback() {
        // Simple audio feedback using Web Audio API
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            oscillator.stop(audioCtx.currentTime + 0.1);
        } catch (e) {
            // Silently fail if audio context not available
        }
    }
    
    dispose() {
        if (this.floorPlan) {
            this.scene.remove(this.floorPlan);
            this.floorPlan.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
        
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
            this.gridHelper.geometry.dispose();
            this.gridHelper.material.dispose();
        }
        
        const panel = document.getElementById('layout-panel');
        if (panel) panel.remove();
        
        const toggleBtn = document.getElementById('layout-toggle-btn');
        if (toggleBtn) toggleBtn.remove();
        
        const style = document.querySelector('style');
        // Only remove if it's the layout style
        if (style && style.textContent.includes('layout-panel')) {
            style.remove();
        }
        
        console.log('🧹 LayoutManager disposed');
    }
}