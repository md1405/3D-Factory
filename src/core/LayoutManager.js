import * as THREE from 'three';

export class LayoutManager {
    constructor(scene, factory) {
        this.scene = scene;
        this.factory = factory;

        // ==================== Layout State ====================
        // "default" means the real original factory arrangement.
        // It is NOT the same as the Linear preset.
        this.currentLayout = 'default';

        this.gap = 2.0;
        this.gridSize = 1;
        this.snapEnabled = true;

        // ==================== Floor Plan Overlay ====================
        this.floorPlan = null;
        this.gridHelper = null;

        // ==================== Equipment References ====================
        this.equipmentRefs = {};

        // Original transforms used by Reset To Default
        this.defaultPositions = {};
        this.defaultRotations = {};
        this.defaultScales = {};

        this.defaultsCaptured = false;

        // ==================== Animation Bookkeeping ====================
        this.positionAnimationFrames = new Map();
        this.rotationAnimationFrames = new Map();

        // ==================== Layout Presets ====================
        this.layouts = {
            linear: {
                name: 'Linear',
                icon: '━',

                positions: {
                    tank1: { x: -6, y: 3.5, z: 6 },
                    tank2: { x: -6, y: 3.5, z: 0 },
                    conveyor: { x: 0, y: -0.5, z: -1 },
                    bottleGroup: { x: 0, y: -0.5, z: -1 }
                },

                rotations: {
                    conveyor: { x: 0, y: Math.PI / 2, z: 0 },
                    bottleGroup: { x: 0, y: Math.PI / 2, z: 0 }
                },

                pipeRotationOffset: 0
            },

            'l-shape': {
                name: 'L-Shape',
                icon: '└',

                positions: {
                    tank1: { x: -6, y: 3.5, z: 6 },
                    tank2: { x: 0, y: 3.5, z: 6 },
                    conveyor: { x: 4, y: -0.5, z: -1 },
                    bottleGroup: { x: 4, y: -0.5, z: -1 }
                },

                rotations: {
                    conveyor: { x: 0, y: Math.PI / 2, z: 0 },
                    bottleGroup: { x: 0, y: Math.PI / 2, z: 0 }
                },

                pipeRotationOffset: Math.PI / 2
            },

            'u-shape': {
                name: 'U-Shape',
                icon: '⊔',

                positions: {
                    tank1: { x: -6, y: 3.5, z: 6 },
                    tank2: { x: 6, y: 3.5, z: 6 },
                    conveyor: { x: 0, y: -0.5, z: -4 },
                    bottleGroup: { x: 0, y: -0.5, z: -4 }
                },

                rotations: {
                    conveyor: { x: 0, y: Math.PI / 2, z: 0 },
                    bottleGroup: { x: 0, y: Math.PI / 2, z: 0 }
                },

                pipeRotationOffset: Math.PI / 2
            }
        };

        // ==================== Initialize ====================
        this.initUI();
        this.createFloorPlan();
        this.createGrid();
    }

    // =========================================================
    // UI
    // =========================================================

    initUI() {
        // Remove an old panel if LayoutManager is recreated.
        const existingPanel = document.getElementById('layout-panel');

        if (existingPanel) {
            existingPanel.remove();
        }

        const panel = document.createElement('div');

        panel.id = 'layout-panel';

        panel.innerHTML = `
            <div class="layout-panel-header">
                <span>🏗️ Layout Configurator</span>

                <button
                    id="layout-close-btn"
                    type="button"
                    aria-label="Close layout panel"
                >
                    ✕
                </button>
            </div>

            <div class="layout-section">
                <div class="layout-section-title">
                    Layout Presets
                </div>

                <div
                    id="layout-presets"
                    class="layout-presets"
                >
                    <button
                        class="layout-preset-btn"
                        data-layout="linear"
                        type="button"
                    >
                        <span class="layout-icon">━</span>
                        <span>Linear</span>
                    </button>

                    <button
                        class="layout-preset-btn"
                        data-layout="l-shape"
                        type="button"
                    >
                        <span class="layout-icon">└</span>
                        <span>L-Shape</span>
                    </button>

                    <button
                        class="layout-preset-btn"
                        data-layout="u-shape"
                        type="button"
                    >
                        <span class="layout-icon">⊔</span>
                        <span>U-Shape</span>
                    </button>
                </div>
            </div>

            <div class="layout-section">
                <div class="layout-section-title">
                    Gap Between Equipment

                    <span id="gap-value">
                        2.0m
                    </span>
                </div>

                <input
                    type="range"
                    id="gap-slider"
                    min="1"
                    max="5"
                    step="0.5"
                    value="2"
                >
            </div>

            <div class="layout-section">
                <label class="layout-checkbox">
                    <input
                        type="checkbox"
                        id="snap-toggle"
                        checked
                    >

                    <span>
                        Snap to Grid (1m × 1m)
                    </span>
                </label>
            </div>

            <div class="layout-section">
                <label class="layout-checkbox">
                    <input
                        type="checkbox"
                        id="floorplan-toggle"
                        checked
                    >

                    <span>
                        Show Floor Plan Overlay
                    </span>
                </label>
            </div>

            <div class="layout-section">
                <button
                    id="reset-layout-btn"
                    class="btn-reset-layout"
                    type="button"
                >
                    🔄 Reset to Default
                </button>
            </div>

            <div
                id="layout-info"
                class="layout-info"
            >
                <div>
                    📐 Floor: 22m × 22m
                </div>

                <div>
                    📏 Grid: 1m × 1m
                </div>

                <div>
                    🏭 Equipment: ${Object.keys(this.equipmentRefs).length} items
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        this.addStyles();
        this.bindEvents();
        this.updateActiveLayoutButton();
    }

    addStyles() {
        const existingStyle = document.getElementById(
            'layout-manager-styles'
        );

        if (existingStyle) {
            existingStyle.remove();
        }

        const style = document.createElement('style');

        style.id = 'layout-manager-styles';

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

                border-bottom:
                    1px solid rgba(255, 255, 255, 0.08);

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

                border-bottom:
                    1px solid rgba(255, 255, 255, 0.04);
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

                grid-template-columns:
                    1fr 1fr 1fr;

                gap: 8px;
            }

            .layout-preset-btn {
                display: flex;

                flex-direction: column;

                align-items: center;

                gap: 6px;

                padding: 12px 8px;

                background:
                    rgba(255, 255, 255, 0.04);

                border:
                    1px solid rgba(255, 255, 255, 0.06);

                border-radius: 8px;

                color: #94a3b8;

                font-size: 12px;

                cursor: pointer;

                transition:
                    all 0.2s ease;
            }

            .layout-preset-btn:hover {
                background:
                    rgba(74, 144, 226, 0.1);

                border-color:
                    rgba(74, 144, 226, 0.3);

                color: #ffffff;

                transform:
                    translateY(-1px);
            }

            .layout-preset-btn.active {
                background:
                    rgba(74, 144, 226, 0.2);

                border-color:
                    #4a90e2;

                color: #ffffff;

                font-weight: 600;

                box-shadow:
                    0 0 15px rgba(74, 144, 226, 0.2);
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

                background:
                    rgba(245, 87, 108, 0.1);

                border:
                    1px solid rgba(245, 87, 108, 0.3);

                border-radius: 6px;

                color: #f5576c;

                font-size: 13px;

                cursor: pointer;

                transition:
                    all 0.2s ease;
            }

            .btn-reset-layout:hover {
                background:
                    rgba(245, 87, 108, 0.2);
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

                    width:
                        calc(100vw - 20px);

                    max-height: 60vh;

                    overflow-y: auto;
                }
            }
        `;

        document.head.appendChild(style);
    }

    bindEvents() {
        // Prevent UI interaction from propagating to the 3D Raycaster/InteractionSystem.
        // Without this, clicking a Layout button can also be interpreted as clicking
        // an object underneath the panel (for example the Raw Milk Storage Tank).
        const panel = document.getElementById('layout-panel');

        if (panel) {
            ['pointerdown', 'mousedown', 'click', 'touchstart'].forEach((eventName) => {
                panel.addEventListener(eventName, (event) => {
                    event.stopPropagation();
                });
            });
        }

        // ==================== Layout preset buttons ====================

        document
            .querySelectorAll('.layout-preset-btn')
            .forEach((btn) => {

                btn.addEventListener('pointerdown', (event) => {
                    event.stopPropagation();
                });

                btn.addEventListener('mousedown', (event) => {
                    event.stopPropagation();
                });

                btn.addEventListener('click', (event) => {
                    event.stopPropagation();

                    const layout = btn.dataset.layout;

                    this.setLayout(layout);

                    this.playClickFeedback();
                });
            });

        // ==================== Gap slider ====================

        const gapSlider =
            document.getElementById('gap-slider');

        const gapValue =
            document.getElementById('gap-value');

        if (gapSlider && gapValue) {

            gapSlider.addEventListener('input', (e) => {

                const value =
                    Number.parseFloat(e.target.value);

                gapValue.textContent =
                    `${value.toFixed(1)}m`;
            });

            gapSlider.addEventListener('change', (e) => {

                const value =
                    Number.parseFloat(e.target.value);

                this.setGap(value);
            });
        }

        // ==================== Snap toggle ====================

        const snapToggle =
            document.getElementById('snap-toggle');

        if (snapToggle) {

            snapToggle.addEventListener('change', (e) => {

                this.snapEnabled =
                    e.target.checked;

                this.applyCurrentLayout();

                console.log(
                    `📏 Snap to grid: ${
                        this.snapEnabled
                            ? 'ON'
                            : 'OFF'
                    }`
                );
            });
        }

        // ==================== Floor plan toggle ====================

        const floorplanToggle =
            document.getElementById('floorplan-toggle');

        if (floorplanToggle) {

            floorplanToggle.addEventListener('change', (e) => {

                const visible =
                    e.target.checked;

                if (this.floorPlan) {
                    this.floorPlan.visible = visible;
                }

                if (this.gridHelper) {
                    this.gridHelper.visible = visible;
                }
            });
        }

        // ==================== Reset ====================

        const resetBtn =
            document.getElementById('reset-layout-btn');

        if (resetBtn) {

            resetBtn.addEventListener('click', (event) => {

                event.stopPropagation();

                this.resetToDefault();

                this.playClickFeedback();
            });
        }

        // ==================== Layout panel toggle ====================

        const layoutToggleBtn =
            document.getElementById(
                'layout-toggle-btn'
            );

        if (layoutToggleBtn) {

            layoutToggleBtn.addEventListener(
                'click',
                (event) => {

                    event.stopPropagation();

                    const panel =
                        document.getElementById(
                            'layout-panel'
                        );

                    if (panel) {
                        panel.classList.toggle('visible');
                    }
                }
            );
        }

        // ==================== Close button ====================

        const closeBtn =
            document.getElementById(
                'layout-close-btn'
            );

        if (closeBtn) {

            closeBtn.addEventListener(
                'click',
                (event) => {

                    event.stopPropagation();

                    const panel =
                        document.getElementById(
                            'layout-panel'
                        );

                    if (panel) {
                        panel.classList.remove('visible');
                    }
                }
            );
        }
    }

    updateActiveLayoutButton() {
        document
            .querySelectorAll('.layout-preset-btn')
            .forEach((btn) => {

                btn.classList.toggle(
                    'active',

                    this.currentLayout !== 'default' &&
                    btn.dataset.layout ===
                        this.currentLayout
                );
            });
    }

    // =========================================================
    // Floor Plan Overlay
    // =========================================================

    createFloorPlan() {
        const floorPlanGeo =
            new THREE.PlaneGeometry(
                21.8,
                21.8
            );

        const floorPlanMat =
            new THREE.MeshBasicMaterial({
                color: 0x4a90e2,

                transparent: true,

                opacity: 0.08,

                side: THREE.DoubleSide,

                depthWrite: false
            });

        this.floorPlan =
            new THREE.Mesh(
                floorPlanGeo,
                floorPlanMat
            );

        this.floorPlan.rotation.x =
            -Math.PI / 2;

        this.floorPlan.position.y =
            0.02;

        this.floorPlan.name =
            'FloorPlan';

        this.floorPlan.renderOrder =
            1;

        // ==================== Border ====================

        const edgesGeo =
            new THREE.EdgesGeometry(
                floorPlanGeo
            );

        const edgesMat =
            new THREE.LineBasicMaterial({
                color: 0x4a90e2,

                transparent: true,

                opacity: 0.3,

                depthTest: false
            });

        const border =
            new THREE.LineSegments(
                edgesGeo,
                edgesMat
            );

        border.rotation.x =
            -Math.PI / 2;

        border.position.y =
            0.03;

        border.renderOrder =
            2;

        this.floorPlan.add(border);

        this.addCornerMarkers();
    }

    addCornerMarkers() {
        const markerMat =
            new THREE.MeshBasicMaterial({
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

            const marker =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        0.15,
                        0.15,
                        0.5,
                        8
                    ),

                    markerMat
                );

            marker.position.set(
                x,
                0.25,
                z
            );

            marker.renderOrder =
                3;

            this.floorPlan.add(
                marker
            );
        });
    }

    createGrid() {
        this.gridHelper =
            new THREE.GridHelper(
                22,
                22,
                0x4a90e2,
                0x4a90e2
            );

        this.gridHelper.position.y =
            0.03;

        this.gridHelper.material.opacity =
            0.12;

        this.gridHelper.material.transparent =
            true;

        this.gridHelper.material.depthTest =
            false;

        this.gridHelper.renderOrder =
            0;
    }

    // =========================================================
    // Core Logic
    // =========================================================

    registerEquipment(
        id,
        mesh,
        captureAsDefault = true
    ) {
        if (!id || !mesh) {

            console.warn(
                '⚠️ registerEquipment requires a valid id and mesh'
            );

            return;
        }

        this.equipmentRefs[id] =
            mesh;

        /*
         * Capture the original transform.
         *
         * IMPORTANT:
         * Only capture it if we do not already have
         * a default for this equipment.
         *
         * This prevents a later registration from
         * accidentally replacing the real default.
         */

        if (
            (captureAsDefault ||
                !this.defaultPositions[id]) &&
            !this.defaultPositions[id]
        ) {

            this.defaultPositions[id] =
                mesh.position.clone();

            this.defaultRotations[id] =
                mesh.rotation.clone();

            this.defaultScales[id] =
                mesh.scale.clone();
        }

        console.log(
            `✅ Registered equipment: ${id}`,

            'pos:',

            this.defaultPositions[id]
                ?.toArray()
                .map((v) => v.toFixed(1))
        );
    }

    /**
     * Explicitly capture the current transforms
     * as the TRUE factory default.
     *
     * Use this after ALL factory equipment has
     * reached the actual original positions.
     */
    captureDefaultLayout() {
        Object
            .entries(this.equipmentRefs)
            .forEach(([id, mesh]) => {

                this.defaultPositions[id] =
                    mesh.position.clone();

                this.defaultRotations[id] =
                    mesh.rotation.clone();

                this.defaultScales[id] =
                    mesh.scale.clone();
            });

        this.defaultsCaptured =
            true;

        console.log(
            '📌 Default factory layout captured'
        );
    }

    setup(scene = this.scene) {
        if (!scene) {

            console.warn(
                '⚠️ LayoutManager.setup: scene not available'
            );

            return;
        }

        if (
            this.floorPlan &&
            !scene.children.includes(
                this.floorPlan
            )
        ) {

            scene.add(
                this.floorPlan
            );
        }

        if (
            this.gridHelper &&
            !scene.children.includes(
                this.gridHelper
            )
        ) {

            scene.add(
                this.gridHelper
            );
        }

        this.updateLayoutInfo();

        console.log(
            '🏗️ LayoutManager setup complete'
        );
    }

    updateLayoutInfo() {
        const equipmentCount =
            document.querySelector(
                '#layout-info div:last-child'
            );

        if (equipmentCount) {

            equipmentCount.textContent =
                `🏭 Equipment: ${
                    Object.keys(
                        this.equipmentRefs
                    ).length
                } items`;
        }
    }

    // =========================================================
    // Set Layout
    // =========================================================

    setLayout(layoutType) {

        if (!this.layouts[layoutType]) {

            console.warn(
                `⚠️ Layout "${layoutType}" not found`
            );

            return;
        }

        this.currentLayout =
            layoutType;

        this.applyCurrentLayout();

        this.updateActiveLayoutButton();

        console.log(
            `🏗️ Layout changed to: ${layoutType}`
        );
    }

    // =========================================================
    // Apply Current Layout
    // =========================================================

    async applyCurrentLayout() {

        /*
         * Default is a real state.
         *
         * It is NOT one of the preset layouts.
         *
         * Therefore we do nothing here.
         * resetToDefault() itself restores the
         * real original transforms.
         */

        if (this.currentLayout === 'default') {
            return;
        }

        const layout =
            this.layouts[
                this.currentLayout
            ];

        if (!layout) {
            return;
        }

        const positionAnimations = [];
        const rotationAnimations = [];

        // ==================== Positions ====================

        Object
            .entries(layout.positions)
            .forEach(([equipId, pos]) => {

                const mesh =
                    this.equipmentRefs[
                        equipId
                    ];

                if (!mesh) {

                    console.warn(
                        `⚠️ Equipment "${equipId}" not registered`
                    );

                    return;
                }

                /*
                 * Apply gap factor.
                 *
                 * NOTE:
                 * This is still the original project's
                 * gap behaviour: coordinates are scaled
                 * by gap / 2.
                 */

                let finalX =
                    pos.x *
                    (this.gap / 2);

                let finalZ =
                    pos.z *
                    (this.gap / 2);

                // ==================== Snap ====================

                if (this.snapEnabled) {

                    finalX =
                        Math.round(
                            finalX /
                            this.gridSize
                        ) *
                        this.gridSize;

                    finalZ =
                        Math.round(
                            finalZ /
                            this.gridSize
                        ) *
                        this.gridSize;
                }

                const target =
                    new THREE.Vector3(
                        finalX,
                        pos.y,
                        finalZ
                    );

                positionAnimations.push(
                    this.animateToPosition(
                        mesh,
                        target
                    )
                );
            });

        // ==================== Rotations ====================

        if (layout.rotations) {

            Object
                .entries(layout.rotations)
                .forEach(
                    ([equipId, rot]) => {

                        const mesh =
                            this.equipmentRefs[
                                equipId
                            ];

                        if (!mesh) {
                            return;
                        }

                        const targetRotation =
                            new THREE.Euler(
                                rot.x,
                                rot.y,
                                rot.z
                            );

                        rotationAnimations.push(
                            this.animateToRotation(
                                mesh,
                                targetRotation
                            )
                        );
                    }
                );
        }

        /*
         * Wait for both position and rotation animations.
         *
         * This fixes the old situation where Pipe was updated
         * before tanks had actually reached their destinations.
         */

        await Promise.all([
            ...positionAnimations,
            ...rotationAnimations
        ]);

        // ==================== Dependent objects ====================

        this.updatePipe();

        this.updateConveyor();
    }

    // =========================================================
    // Gap
    // =========================================================

    setGap(value) {

        if (!Number.isFinite(value)) {

            console.warn(
                '⚠️ Invalid gap value:',
                value
            );

            return;
        }

        this.gap = value;

        const gapDisplay =
            document.getElementById(
                'gap-value'
            );

        if (gapDisplay) {

            gapDisplay.textContent =
                `${value.toFixed(1)}m`;
        }

        /*
         * If we are in Default state,
         * do not move equipment.
         *
         * Gap is meaningful only for presets.
         */

        if (
            this.currentLayout !== 'default'
        ) {

            this.applyCurrentLayout();
        }

        console.log(
            `📏 Gap set to: ${value}m`
        );
    }

    // =========================================================
    // Position Animation
    // =========================================================

    animateToPosition(
        mesh,
        targetPos,
        duration = 800
    ) {

        if (!mesh || !targetPos) {
            return Promise.resolve();
        }

        // Cancel previous animation.
        const previousFrame =
            this.positionAnimationFrames.get(
                mesh
            );

        if (previousFrame) {

            cancelAnimationFrame(
                previousFrame
            );

            this.positionAnimationFrames.delete(
                mesh
            );
        }

        const startPos =
            mesh.position.clone();

        const startTime =
            performance.now();

        return new Promise(
            (resolve) => {

                const animate =
                    (currentTime) => {

                        const elapsed =
                            currentTime -
                            startTime;

                        const progress =
                            Math.min(
                                elapsed /
                                    duration,
                                1
                            );

                        // Ease-in-out cubic
                        const eased =
                            progress < 0.5
                                ? 4 *
                                  progress *
                                  progress *
                                  progress

                                : 1 -
                                  Math.pow(
                                      -2 *
                                          progress +
                                          2,
                                      3
                                  ) /
                                      2;

                        mesh.position.lerpVectors(
                            startPos,
                            targetPos,
                            eased
                        );

                        if (
                            progress < 1
                        ) {

                            const frameId =
                                requestAnimationFrame(
                                    animate
                                );

                            this.positionAnimationFrames.set(
                                mesh,
                                frameId
                            );

                        } else {

                            mesh.position.copy(
                                targetPos
                            );

                            this.positionAnimationFrames.delete(
                                mesh
                            );

                            resolve();
                        }
                    };

                const frameId =
                    requestAnimationFrame(
                        animate
                    );

                this.positionAnimationFrames.set(
                    mesh,
                    frameId
                );
            }
        );
    }

    // =========================================================
    // Rotation Animation
    // =========================================================

    animateToRotation(
        mesh,
        targetRot,
        duration = 800
    ) {

        if (!mesh || !targetRot) {
            return Promise.resolve();
        }

        // Cancel previous rotation animation.
        const previousFrame =
            this.rotationAnimationFrames.get(
                mesh
            );

        if (previousFrame) {

            cancelAnimationFrame(
                previousFrame
            );

            this.rotationAnimationFrames.delete(
                mesh
            );
        }

        const startRot =
            mesh.rotation.clone();

        const startTime =
            performance.now();

        return new Promise(
            (resolve) => {

                const animate =
                    (currentTime) => {

                        const elapsed =
                            currentTime -
                            startTime;

                        const progress =
                            Math.min(
                                elapsed /
                                    duration,
                                1
                            );

                        // Ease-in-out cubic
                        const eased =
                            progress < 0.5
                                ? 4 *
                                  progress *
                                  progress *
                                  progress

                                : 1 -
                                  Math.pow(
                                      -2 *
                                          progress +
                                          2,
                                      3
                                  ) /
                                      2;

                        mesh.rotation.x =
                            startRot.x +
                            (
                                targetRot.x -
                                startRot.x
                            ) *
                            eased;

                        mesh.rotation.y =
                            startRot.y +
                            (
                                targetRot.y -
                                startRot.y
                            ) *
                            eased;

                        mesh.rotation.z =
                            startRot.z +
                            (
                                targetRot.z -
                                startRot.z
                            ) *
                            eased;

                        if (
                            progress < 1
                        ) {

                            const frameId =
                                requestAnimationFrame(
                                    animate
                                );

                            this.rotationAnimationFrames.set(
                                mesh,
                                frameId
                            );

                        } else {

                            mesh.rotation.copy(
                                targetRot
                            );

                            this.rotationAnimationFrames.delete(
                                mesh
                            );

                            resolve();
                        }
                    };

                const frameId =
                    requestAnimationFrame(
                        animate
                    );

                this.rotationAnimationFrames.set(
                    mesh,
                    frameId
                );
            }
        );
    }

    // =========================================================
    // Pipe
    // =========================================================

    updatePipe() {
        const tank1 = this.equipmentRefs['tank1'];
        const tank2 = this.equipmentRefs['tank2'];
        const pipe = this.equipmentRefs['pipe'];

        if (!tank1 || !tank2 || !pipe) {
            return;
        }

        const distance =
            tank1.position.distanceTo(tank2.position);

        const midPoint =
            new THREE.Vector3()
                .addVectors(
                    tank1.position,
                    tank2.position
                )
                .multiplyScalar(0.5);

        const pipeY =
            this.defaultPositions['pipe']
                ? this.defaultPositions['pipe'].y
                : 3;

        pipe.position.set(
            midPoint.x,
            pipeY,
            midPoint.z
        );

        const direction =
            new THREE.Vector3()
                .subVectors(
                    tank2.position,
                    tank1.position
                );

        const angleY =
            Math.atan2(
                direction.x,
                direction.z
            );

        // Rotation مخصوص Layout فعلی
        const layout =
            this.layouts[this.currentLayout];

        const pipeRotationOffset =
            layout?.pipeRotationOffset ?? 0;

        pipe.rotation.set(
            Math.PI / 2,
            angleY + pipeRotationOffset,
            0
        );

        const defaultPipeLength = 6;

        pipe.scale.set(
            1,
            distance / defaultPipeLength,
            1
        );

        console.log(
            `🔧 Pipe: distance=${distance.toFixed(1)}m, ` +
            `angleY=${(
                (angleY + pipeRotationOffset) *
                180 /
                Math.PI
            ).toFixed(1)}°`
        );
    }

    // =========================================================
    // Conveyor
    // =========================================================

    updateConveyor() {
        const conveyor =
            this.equipmentRefs['conveyor'];

        const bottleGroup =
            this.equipmentRefs['bottleGroup'];

        if (!conveyor || !bottleGroup) {
            return;
        }

        bottleGroup.position.copy(
            conveyor.position
        );

        bottleGroup.rotation.copy(
            conveyor.rotation
        );

        console.log(
            '🍾 BottleGroup synchronized with Conveyor'
        );
    }
    // =========================================================
    // Move Equipment Manually
    // =========================================================

    moveEquipment(
        equipId,
        position
    ) {

        const mesh =
            this.equipmentRefs[
                equipId
            ];

        if (!mesh) {

            console.warn(
                `⚠️ Equipment "${equipId}" not found`
            );

            return;
        }

        let targetPosition;

        if (
            position &&
            typeof position.clone ===
                'function'
        ) {

            targetPosition =
                position.clone();

        } else {

            targetPosition =
                new THREE.Vector3(
                    position?.x ?? 0,
                    position?.y ?? 0,
                    position?.z ?? 0
                );
        }

        // Snap only X and Z.
        if (this.snapEnabled) {

            targetPosition.x =
                Math.round(
                    targetPosition.x /
                        this.gridSize
                ) *
                this.gridSize;

            targetPosition.z =
                Math.round(
                    targetPosition.z /
                        this.gridSize
                ) *
                this.gridSize;
        }

        const animation =
            this.animateToPosition(
                mesh,
                targetPosition
            );

        // Tank movement affects Pipe.
        if (
            equipId === 'tank1' ||
            equipId === 'tank2'
        ) {

            animation.then(() => {
                this.updatePipe();
            });

            return;
        }

        // Conveyor movement affects Conveyor system.
        if (
            equipId === 'conveyor'
        ) {

            animation.then(() => {
                this.updateConveyor();
            });
        }
    }

    // =========================================================
    // Reset To Default
    // =========================================================

    async resetToDefault() {

        /*
         * IMPORTANT:
         *
         * Default is the real original factory layout.
         *
         * It is NOT the Linear preset.
         */

        this.currentLayout =
            'default';

        this.gap = 2.0;

        this.snapEnabled = true;

        this.updateActiveLayoutButton();

        // ==================== Reset UI ====================

        const gapSlider =
            document.getElementById(
                'gap-slider'
            );

        const gapValue =
            document.getElementById(
                'gap-value'
            );

        const snapToggle =
            document.getElementById(
                'snap-toggle'
            );

        if (gapSlider) {
            gapSlider.value = '2';
        }

        if (gapValue) {
            gapValue.textContent =
                '2.0m';
        }

        if (snapToggle) {
            snapToggle.checked = true;
        }

        // ==================== Restore Equipment ====================

        const animations = [];

        Object
            .entries(this.equipmentRefs)
            .forEach(([id, mesh]) => {

                const defaultPosition =
                    this.defaultPositions[id];

                const defaultRotation =
                    this.defaultRotations[id];

                const defaultScale =
                    this.defaultScales[id];

                // Restore Position
                if (defaultPosition) {

                    animations.push(
                        this.animateToPosition(
                            mesh,
                            defaultPosition.clone()
                        )
                    );
                }

                // Restore Rotation
                if (defaultRotation) {

                    animations.push(
                        this.animateToRotation(
                            mesh,
                            defaultRotation.clone()
                        )
                    );
                }

                // Restore Scale
                if (defaultScale) {

                    /*
                     * Scale is restored immediately.
                     * This manager does not animate scale.
                     */
                    mesh.scale.copy(
                        defaultScale
                    );
                }
            });

        /*
         * Wait until all position and rotation
         * animations are finished.
         */
        await Promise.all(
            animations
        );

        /*
         * Do NOT call updatePipe() here.
         *
         * Reset should restore the pipe's exact
         * original transform instead of recalculating
         * it from the current tank positions.
         */

        this.updateConveyor();

        console.log(
            '🔄 Layout reset to real default factory layout'
        );
    }

    // =========================================================
    // Click Sound
    // =========================================================

    playClickFeedback() {

        try {

            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContextClass) {
                return;
            }

            const audioCtx =
                new AudioContextClass();

            const oscillator =
                audioCtx.createOscillator();

            const gainNode =
                audioCtx.createGain();

            oscillator.connect(
                gainNode
            );

            gainNode.connect(
                audioCtx.destination
            );

            oscillator.frequency.value =
                800;

            oscillator.type =
                'sine';

            gainNode.gain.value =
                0.1;

            oscillator.start();

            gainNode.gain
                .exponentialRampToValueAtTime(
                    0.001,
                    audioCtx.currentTime +
                        0.1
                );

            oscillator.stop(
                audioCtx.currentTime +
                    0.1
            );

        } catch (e) {

            // Audio is optional.
        }
    }

    // =========================================================
    // Dispose
    // =========================================================

    dispose() {

        // ==================== Cancel animations ====================

        this.positionAnimationFrames
            .forEach((frameId) => {
                cancelAnimationFrame(
                    frameId
                );
            });

        this.rotationAnimationFrames
            .forEach((frameId) => {
                cancelAnimationFrame(
                    frameId
                );
            });

        this.positionAnimationFrames.clear();
        this.rotationAnimationFrames.clear();

        // ==================== Floor Plan ====================

        if (this.floorPlan) {

            this.scene.remove(
                this.floorPlan
            );

            this.floorPlan.traverse(
                (child) => {

                    if (child.geometry) {
                        child.geometry.dispose();
                    }

                    if (child.material) {

                        if (
                            Array.isArray(
                                child.material
                            )
                        ) {

                            child.material.forEach(
                                (material) => {
                                    material.dispose();
                                }
                            );

                        } else {

                            child.material.dispose();
                        }
                    }
                }
            );

            this.floorPlan = null;
        }

        // ==================== Grid ====================

        if (this.gridHelper) {

            this.scene.remove(
                this.gridHelper
            );

            if (
                this.gridHelper.geometry
            ) {

                this.gridHelper.geometry.dispose();
            }

            if (
                Array.isArray(
                    this.gridHelper.material
                )
            ) {

                this.gridHelper.material.forEach(
                    (material) => {
                        material.dispose();
                    }
                );

            } else if (
                this.gridHelper.material
            ) {

                this.gridHelper.material.dispose();
            }

            this.gridHelper = null;
        }

        // ==================== Panel ====================

        const panel =
            document.getElementById(
                'layout-panel'
            );

        if (panel) {
            panel.remove();
        }

        // ==================== Toggle button ====================

        const toggleBtn =
            document.getElementById(
                'layout-toggle-btn'
            );

        if (toggleBtn) {
            toggleBtn.remove();
        }

        // ==================== Style ====================

        const style =
            document.getElementById(
                'layout-manager-styles'
            );

        if (style) {
            style.remove();
        }

        console.log(
            '🧹 LayoutManager disposed'
        );
    }
}