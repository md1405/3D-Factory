import * as THREE from 'three';
// import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

//core
import Sizes from './Sizes';
import Time from './Time';
import Camera from './Camera';
import Renderer from './Renderer';
import AssetManager from './AssetManager'; 
import RaycasterManager from "./RaycasterManager";
import { TourManager } from './TourManager';
import ConfigManager from './ConfigManager.js'
import { LayoutManager } from './LayoutManager.js';

//utils
// import AxisGridHelper from '../utils/AxisGridHelper'

// ui

//factory
import Factory from '../factory/Factory';
import { equipmentData } from "../factory/EquipmentData";

//objects
import Light from '../objects/Lights';
import  Bottle  from '../objects/Bottle.js';
import  Conveyor  from '../objects/Conveyor.js';
import FactoryHall from '../objects/FactoryHall';
import Floor from '../objects/Floor.js';
import LoadingArea from '../objects/LoadingArea';
import SectionalDoor from '../objects/SectionalDoor';
import Tank from '../objects/Tank';
// import WalkWay from '../objects/WalkWay';
import Pipe from '../objects/Pipe.js';
 

export default class App {
    constructor() {
        this.canvas = document.querySelector('.webgl');
        if (!this.canvas) {
            throw new Error('Canvas element with class "webgl" not found');
        }

        //gui
        // this.gui = new GUI();
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xdfe5ea);
        this.scene.fog = new THREE.Fog(0xdfe5ea, 15, 40);

        // Create AssetManager
        this.assetManager = new AssetManager();
        
        // Start loading process and then setup scene
        this.init();
    }

    //init
    async init() {
        try {
            this.assetManager.showLoadingScreen();
            
            // Load assets
            await this.loadAssets();
            
            // Setup scene after successful loading
            await this.setupScene();
            
            console.log("🎮 Game is ready!");
        } catch (error) {
            console.error("❌ Setup error:", error);
            if (this.assetManager) {
                this.assetManager.showError('Failed to load game assets!');
            }
        }
    }    

    //loadAssets
    async loadAssets() {
        try {
            await Promise.all([
                //hdrs
                this.assetManager.loadHDR('boiler_room', 
                    this.assetManager.assetPath('hdr/boiler_room.hdr')
                ),

                //models
                this.assetManager.loadOBJModel(
                    'medicStaff', 
                    this.assetManager.assetPath('models/medic-staff/medic-staff.obj')
                ),

                //textures
                this.assetManager.loadTexture('medicStaff_color', 
                    this.assetManager.assetPath('models/medic-staff/texture_pbr_20250901.png'), true),
                this.assetManager.loadTexture('medicStaff_normal', 
                    this.assetManager.assetPath('models/medic-staff/texture_pbr_20250901_normal.png'), false),
                this.assetManager.loadTexture('medicStaff_roughness', 
                    this.assetManager.assetPath('models/medic-staff/texture_pbr_20250901_roughness.png'), false),
                this.assetManager.loadTexture('medicStaff_metallic', 
                    this.assetManager.assetPath('models/medic-staff/texture_pbr_20250901_metallic.png'), false),
            ]);

            this.assetManager.setEnvironmentMap('boiler_room', this.scene, {
                background: false,
                intensity: 1.0
            });
            
            console.log('All assets loaded successfully!');
        } catch (error) {
            console.error('Failed to load assets:', error);
            throw error; 
        }
    }

    //setupScene
    async setupScene() {

        // sizes
        this.sizes = new Sizes();

        // camera
        this.camera = new Camera(this.sizes, this.canvas);

        // renderer
        this.renderer = new Renderer(this.canvas, this.scene, this.camera);

        // light       
        this.light = new Light(this.scene);
        this.scene.add(this.light);

        // tank1
        this.tank1 = new Tank();
        this.tank1.position.set(-4, 3.5, 6);
        this.tank1.name = "MilkTank01";

        this.tank1.userData.equipmentId =
            "rawMilkTank";

        this.tank1.userData.equipmentId =
            "rawMilkTank";

        // tank2
        this.tank2 = new Tank();
        this.tank2.position.set(-4, 3.5, 0);
        this.tank2.name = "MilkTank02";

        this.tank2.userData.equipmentId =
            "pasteurizationTank";

        this.tank2.userData.equipmentId =
            "pasteurizationTank";        

        // names
        this.tank1.TankLadder.name = "TankLadder01"
        this.tank2.TankLadder.name = "TankLadder02"

        this.tank1.TankPlatform.name = "TankPlatform01"
        this.tank2.TankPlatform.name = "TankPlatform02"

        // factory
        this.floor = new Floor();
        this.pipe = new Pipe();
        this.hall = new FactoryHall();
        this.door = new SectionalDoor();
        // this.walkWay = new WalkWay();
        this.conveyor = new Conveyor();

        this.conveyor.userData.equipmentId = "conveyor";

        // 🔥 گروه بطری‌ها
        this.bottleGroup = new THREE.Group();
        this.bottles = [];

        // تابع ساخت بطری‌ها بر اساس طول conveyor
        this.createBottles = () => {
            // پاک کردن بطری‌های قبلی
            while (this.bottleGroup.children.length > 0) {
                this.bottleGroup.remove(this.bottleGroup.children[0]);
            }
            this.bottles = [];
            
            const conveyorLength = equipmentData.conveyor.currentConfig.length || 8;
            const spacing = 1.0;

            const beltStart = -conveyorLength / 2 + 0.4;
            const beltEnd = conveyorLength / 2 - 0.4;

            const beltUsable = beltEnd - beltStart;

            const count = Math.floor(beltUsable / spacing);

            for (let i = 0; i < count; i++) {

                const bottle = new Bottle();

                bottle.scale.set(0.5, 0.5, 0.5);

                bottle.position.set(
                    beltStart + i * spacing,
                    2.25,
                    3
                );

                this.bottleGroup.add(bottle);
                this.bottles.push(bottle);
            }
            
            console.log(`🍾 Created ${count} bottles for ${conveyorLength}m conveyor`);
        };

        // ساخت اولیه بطری‌ها
        this.createBottles();

        this.bottleGroup.position.copy(this.conveyor.position);
        this.bottleGroup.rotation.copy(this.conveyor.rotation);

        this.factory = new Factory();

        this.factory.add(this.conveyor);
        this.factory.add(this.bottleGroup);


        const medicStaffModel = this.assetManager.assets.models['medicStaff'];
    
        if (medicStaffModel) {
            // Clone it so you can add multiple instances
            const medicStaff = medicStaffModel.clone();

            medicStaff.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        map: this.assetManager.assets.textures['medicStaff_color'],
                        normalMap: this.assetManager.assets.textures['medicStaff_normal'],
                        roughnessMap: this.assetManager.assets.textures['medicStaff_roughness'],
                        metalnessMap: this.assetManager.assets.textures['medicStaff_metallic'],
                    });
                }
            });
            
            // Position it where you want in the factory
            medicStaff.position.set(-3, 0, -3);
            medicStaff.rotation.y = Math.PI / 2
            medicStaff.scale.set(3, 3, 3);

            this.medicStaff = medicStaff;
            
            // Add to your factory or scene
            this.factory.add(medicStaff);

            console.log('✅ MedicStaff created:', this.medicStaff.position);
        } else {
            console.warn('⚠️ MedicStaff model not found!');
        }

        this.factory.add(this.floor);
        this.factory.add(this.hall);
        this.factory.add(this.tank1);
        this.factory.add(this.tank2);
        this.factory.add(this.pipe);
        this.factory.add(this.door);
        // this.factory.add(this.walkWay);
        this.scene.add(this.factory);

        this.loadingArea = new LoadingArea();
        this.scene.add(this.loadingArea);

        // // axisGridHelpers
        // const makeAxisGrid = (node, label, units = 10) => {
        //     const helper = new AxisGridHelper(node, units);
        //     this.gui.add(helper, 'visible').name(label);
        // }
        // makeAxisGrid(this.scene, 'scene', 50);
        // makeAxisGrid(this.factory, 'factory', 22);
        


        // resize
        this.resizeHandler = () => {
            if (this.camera && this.renderer) {
                this.camera.resize();
                this.renderer.resize();
            }
        };


        // Timer setup
        this.time = new Time();    
        this.timer = new THREE.Timer();
        
        const speed = 0.02
        const min = -4
        const max = 4

        // tick
        this.tickHandler = () => {
            const conveyorLength = equipmentData.conveyor.currentConfig.length || 8;

            const min = -conveyorLength / 2 + 0.4;
            const max =  conveyorLength / 2 - 0.4;

            this.bottles.forEach((bottle) => {

                const conveyorSpeed =
                    equipmentData.conveyor.currentConfig.speed || 0.5;

                const speedMultiplier = conveyorSpeed / 0.5;

                bottle.position.x += 0.02 * speedMultiplier;

                const beltLength = max - min;

                if (bottle.position.x >= max) {
                    bottle.position.x -= beltLength;
                }
            });

            if (this.rollers) {
                this.rollers.start.rotation.x += rollerRotationSpeed;
            }


            //contols
            this.camera.update();

            //renderer
            this.renderer.update();
        };
        
        this.sizes.on('resize', this.resizeHandler);
        this.time.on('tick', this.tickHandler);

        
        // ==========================================
        // InfoPanel & Raycaster 
        // ==========================================

        this.raycaster = new RaycasterManager(
            this.camera.instance,
            this.scene
        );

        this.raycaster.register(this.tank1);
        this.raycaster.register(this.tank2);
        this.raycaster.register(this.conveyor);

        this.language = "en";

        // // ✅ Callback انتخاب تجهیز
        // this.raycaster.onSelect = (object) => {
        //     console.log('🖱️ Selected:', object.userData.equipmentId);
            
        //     const equipment = equipmentData[object.userData.equipmentId];
            
        //     if (!equipment) {
        //         console.warn('⚠️ No data for:', object.userData.equipmentId);
        //         return;
        //     }
            
        //     // ✅ دسترسی صحیح به اطلاعات دو زبانه
        //     const data = equipment.info?.[this.language] || equipment.info?.en;
            
        //     if (data) {
        //         console.log('📝 Showing InfoPanel:', data.title);
        //         this.infoPanel.show(data.title, data.description);
                
        //         // نمایش نام در selected-equipment
        //         const equipmentName = document.getElementById('equipment-name');
        //         const selectedEquipment = document.getElementById('selected-equipment');
        //         if (equipmentName) equipmentName.textContent = data.title;
        //         if (selectedEquipment) selectedEquipment.classList.add('visible');
        //     }
        // };

        // ✅ Callback لغو انتخاب
        this.raycaster.onDeselect = () => {
            console.log('👆 Deselected');
            
            const selectedEquipment = document.getElementById('selected-equipment');
            if (selectedEquipment) selectedEquipment.classList.remove('visible');
        };

        // ==========================================
        // TourManager
        // ==========================================
        this.tourManager = new TourManager(
            this.camera.instance, 
            this.camera.controls,  
            this.scene
        );
        // ==========================================
        // LayoutManager — Layout Configurator v0.3
        // ==========================================

        // توی setupScene، بعد از ساختن همه تجهیزات اضافه کن:
        this.layoutManager = new LayoutManager(this.scene, this.factory);

        // Register all equipment references
        this.layoutManager.registerEquipment('tank1', this.tank1);
        this.layoutManager.registerEquipment('tank2', this.tank2);
        this.layoutManager.registerEquipment('pipe', this.pipe);
        this.layoutManager.registerEquipment('conveyor', this.conveyor);
        this.layoutManager.registerEquipment('bottleGroup', this.bottleGroup);

        // Setup floor plan and grid
        this.layoutManager.setup(this.scene);

        // ==========================================
        // ConfigManager — Equipment Configurator
        // ==========================================
        this.configManager = new ConfigManager();

        // Toggle button
        const configToggleBtn = document.getElementById('config-toggle-btn');
        if (configToggleBtn) {
            configToggleBtn.addEventListener('click', () => {
                this.configManager.toggle();
            });
        }

        this.configManager.onConfigChange = (equipmentId, config) => {  
            console.log('🔧 Config changed:', equipmentId, config);
            
            let targetObject = null;
            this.scene.traverse((child) => {
                if (child.userData.equipmentId === equipmentId) {
                    targetObject = child;
                }
            });
            
            if (targetObject && targetObject.applyConfig) {
                targetObject.applyConfig(config);
                
                // 🔥 اگه conveyor بود و طول تغییر کرد، بطری‌ها رو rebuild کن
                if (equipmentId === 'conveyor' && config.length !== undefined) {
                    this.createBottles();
                    this.bottleGroup.position.copy(targetObject.position);
                    this.bottleGroup.rotation.copy(targetObject.rotation);
                }
            }
        };
        

        // Also open config panel when clicking on equipment (optional)
        const originalRaycasterCallback = this.raycaster.onSelect;
        this.raycaster.onSelect = (object) => {
            // Call original callback
            if (originalRaycasterCallback) {
                originalRaycasterCallback(object);
            }
            
            // Open config panel for this equipment
            if (object.userData.equipmentId) {
                this.configManager.selectEquipment(object.userData.equipmentId);
                this.configManager.show();
            }
        };
        // ==========================================
        // LayoutManager — Layout Configurator v0.3
        // ==========================================

        // ساخت LayoutManager
        this.layoutManager = new LayoutManager(this.scene, this.factory);

        // ثبت تمام تجهیزات
        this.layoutManager.registerEquipment('tank1', this.tank1);
        this.layoutManager.registerEquipment('tank2', this.tank2);
        this.layoutManager.registerEquipment('pipe', this.pipe);
        this.layoutManager.registerEquipment('conveyor', this.conveyor);
        this.layoutManager.registerEquipment('bottleGroup', this.bottleGroup);

        // ثبت medicStaff
        if (this.medicStaff) {
            this.layoutManager.registerEquipment('medicStaff', this.medicStaff);
        }

        // Setup floor plan and grid
        this.layoutManager.setup(this.scene);

        // 🔴 اضافه کردن این بخش برای تست و اطمینان از کارکرد دکمه
        console.log('🔍 Checking layout toggle button...');
        const layoutToggleBtn = document.getElementById('layout-toggle-btn');
        if (layoutToggleBtn) {
            console.log('✅ Layout toggle button found');
            
            // حذف event listener قبلی (اگر وجود داشته باشد)
            const newLayoutToggleBtn = layoutToggleBtn.cloneNode(true);
            layoutToggleBtn.parentNode.replaceChild(newLayoutToggleBtn, layoutToggleBtn);
            
            // اضافه کردن event listener جدید
            newLayoutToggleBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                
                const panel = document.getElementById('layout-panel');
                if (panel) {
                    panel.classList.toggle('visible');
                    console.log('🔄 Layout panel toggled:', panel.classList.contains('visible'));
                } else {
                    console.warn('⚠️ Layout panel not found!');
                }
            });
        } else {
            console.warn('⚠️ Layout toggle button not found!');
        }
    }

    destroy() {
        // Clean up AssetManager
        if (this.assetManager) {
            this.assetManager.disposeAll();
        }
        
        if (this.sizes) this.sizes.off('resize', this.resizeHandler);
        if (this.time) this.time.off('tick', this.tickHandler);
        
        this.renderer?.dispose();
        this.scene?.clear();
        
        this.cube = null;
        this.barrel = null;
        this.light = null;
        this.camera = null;
        this.renderer = null;
        this.scene = null;
    }
}