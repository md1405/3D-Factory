import * as THREE from 'three';
import GUI from 'lil-gui'
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

//core
import Sizes from './Sizes';
import Time from './Time';
import Camera from './Camera';
import Renderer from './Renderer';
import AssetManager from './AssetManager'; 


//utils
import AxisGridHelper from '../utils/AxisGridHelper'

//factory
import Factory from '../factory/Factory';

//objects
import Light from '../objects/Lights';
import Canveyor from '../objects/Conveyor';
import FactoryHall from '../objects/FactoryHall';
import Floor from '../objects/Floor';
import LoadingArea from '../objects/LoadingArea';
// import Pipe from '../objects/Pipe';
import SectionalDoor from '../objects/SectionalDoor';
import Tank from '../objects/Tank';
import WalkWay from '../objects/WalkWay';
 

export default class App {
    constructor() {
        this.canvas = document.querySelector('.webgl');
        if (!this.canvas) {
            throw new Error('Canvas element with class "webgl" not found');
        }

        //gui
        this.gui = new GUI();
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xccd0da);
        this.scene.fog = new THREE.Fog(0xccd0da, 15, 40);

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
                background: true,
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
        //size
        this.sizes = new Sizes();

        //camera
        this.camera = new Camera(this.sizes, this.canvas);

        //renderer
        this.renderer = new Renderer(this.canvas, this.scene, this.camera);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        //light       
        this.light = new Light(this.scene);
        this.scene.add(this.light);

        //tank1
        const tank1 = new Tank();
        tank1.position.set(-4, 2.5, 6);
        tank1.name = "MilkTank01";

        //tank2
        const tank2 = new Tank();
        tank2.position.set(-4, 2.5, 0);
        tank2.name = "MilkTank02";

        const conveyor1 = new Canveyor();
        conveyor1.position.set(-2, 0, -3);
        conveyor1.rotation.y = Math.PI / 2;
        conveyor1.scale.set(0.7, 0.7, 0.7)
        conveyor1.name = "conveyor01";


        // pipe
        const start = new THREE.Vector3(tank1.position.x, 1.5, tank1.position.z);
        const end = new THREE.Vector3(tank2.position.x, 1.5, tank2.position.z);
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

        const pipeGeometry = new THREE.CylinderGeometry(0.08, 0.08, length, 16);
        const pipeMaterial = new THREE.MeshStandardMaterial({
            color: 0xd8d8d8,
            metalness: 1.0,
            roughness: 0.15,
        })
        const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
        pipe.position.copy(midPoint);
        
        // Orientation pipe
        pipe.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.normalize()
        );
    
        pipe.castShadow = true;
        pipe.receiveShadow = true;
        pipe.name = "Pipe";

        // names
        // tank1.TankLadder.name = "TankLadder01"
        // tank2.TankLadder.name = "TankLadder02"

        // tank1.TankPlatform.name = "TankPlatform01"
        // tank2.TankPlatform.name = "TankPlatform02"



        //factory
        const floor = new Floor();
        const hall = new FactoryHall();
        const door = new SectionalDoor();
        const walkWay = new WalkWay();

        this.factory = new Factory();
        this.factory.add(floor);
        this.factory.add(hall);
        this.factory.add(tank1);
        this.factory.add(tank2);
        this.factory.add(pipe);
        this.factory.add(conveyor1);
        this.factory.add(door);
        this.factory.add(walkWay);
        this.scene.add(this.factory);

        this.loadingArea = new LoadingArea();
        this.scene.add(this.loadingArea);

        //helpers
        const makeAxisGrid = (node, label, units = 10) => {
            const helper = new AxisGridHelper(node, units);
            this.gui.add(helper, 'visible').name(label);
        }
        makeAxisGrid(this.scene, 'scene', 50);
        makeAxisGrid(this.factory, 'factory', 22);        




        this.resizeHandler = () => {
            if (this.camera && this.renderer) {
                this.camera.resize();
                this.renderer.resize();
            }
        };

        // Timer setup
        this.time = new Time();    
        this.timer = new THREE.Timer();
        
        this.tickHandler = () => {
            

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