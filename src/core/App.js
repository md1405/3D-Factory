import * as THREE from 'three';
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

//core
import Sizes from './Sizes';
import Time from './Time';
import Camera from './Camera';
import Renderer from './Renderer';
import AssetManager from './AssetManager'; 
import RaycasterManager from "./RaycasterManager";

//utils
import AxisGridHelper from '../utils/AxisGridHelper'

// ui
import InfoPanel from "../ui/InfoPanel";

//factory
import Factory from '../factory/Factory';
import { equipmentData} from "../factory/EquipmentRegistry";

//objects
import Light from '../objects/Lights';
import  Bottle  from '../objects/Bottle.js';
import  Conveyor  from '../objects/Conveyor.js';
import FactoryHall from '../objects/FactoryHall';
import LoadingArea from '../objects/LoadingArea';
import SectionalDoor from '../objects/SectionalDoor';
import Tank from '../objects/Tank';
import WalkWay from '../objects/WalkWay';
import Pipe from '../objects/Pipe.js';
 

export default class App {
    constructor() {
        this.canvas = document.querySelector('.webgl');
        if (!this.canvas) {
            throw new Error('Canvas element with class "webgl" not found');
        }

        //gui
        this.gui = new GUI();
        
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
                this.assetManager.loadHDR('boiler_room', '/hdr/boiler_room.hdr'),

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
        this.pipe = new Pipe();
        this.hall = new FactoryHall();
        this.door = new SectionalDoor();
        this.walkWay = new WalkWay();
        this.conveyor = new Conveyor();

        this.conveyor.userData.equipmentId = "conveyor";

        const bottles = [];

        for(let i=0;i<5;i++){
            this.bottle = new Bottle();
            this.bottle.position.set(-4 + (i * 1.5), 2.5, 3 ) ;
            this.conveyor.add(this.bottle);
            bottles.push(this.bottle)
        }

        this.factory = new Factory();
        this.factory.add(this.conveyor);
        this.factory.add(this.hall);
        this.factory.add(this.tank1);
        this.factory.add(this.tank2);
        this.factory.add(this.pipe);
        this.factory.add(this.door);
        this.factory.add(this.walkWay);
        this.scene.add(this.factory);

        this.loadingArea = new LoadingArea();
        this.scene.add(this.loadingArea);

        // axisGridHelpers
        const makeAxisGrid = (node, label, units = 10) => {
            const helper = new AxisGridHelper(node, units);
            this.gui.add(helper, 'visible').name(label);
        }
        makeAxisGrid(this.scene, 'scene', 50);
        makeAxisGrid(this.factory, 'factory', 22);
        
        // infopanel

        this.infoPanel = new InfoPanel();
        this.raycaster = new RaycasterManager(
            this.camera.instance,
            this.scene
        )
        
        this.raycaster.register(this.tank1);
        this.raycaster.register(this.tank2);
        this.raycaster.register(this.conveyor);

        this.language = "fa";
        this.raycaster.onSelect = (object) => {
            const equipment =
                equipmentData[
                    object.userData.equipmentId
                ];

            if (!equipment) {
                return;
            }
            const data =
                equipment[this.language];

            this.infoPanel.show(
                data.title,
                data.description
            );
        };
        this.raycaster.onDeselect = () => {

            this.infoPanel.hide();

        }; 

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

            bottles.forEach(bottle => {
                bottle.position.x += speed;
                
                if(bottle.position.x > max) {
                    bottle.position.x = min;
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