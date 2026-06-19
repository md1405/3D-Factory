import * as THREE from 'three';
import GUI from 'lil-gui'

//core
import Sizes from './Sizes';
import Time from './Time';
import Camera from './Camera';
import Renderer from './Renderer';

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
import SectionalDoor from '../objects/SectionalDoor';
import Tank from '../objects/Tank';
import WalkWay from '../objects/WalkWay';
 

export default class App {
    constructor() {
        //canvas
        this.canvas = document.querySelector('.webgl');
        if (!this.canvas) {
            throw new Error('Canvas element with class "webgl" not found');
        }

        //gui
        this.gui = new GUI();

        //scene        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xccd0da);

        //core
        this.sizes = new Sizes();
        this.camera = new Camera(this.sizes, this.canvas);
        this.renderer = new Renderer(this.canvas, this.scene, this.camera);

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

        //factory
        const floor = new Floor();
        const hall = new FactoryHall();
        const door = new SectionalDoor;
        const walkWay = new WalkWay;

        this.factory = new Factory();
        this.factory.add(floor);
        this.factory.add(hall);
        this.factory.add(tank1);
        this.factory.add(tank2);
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

        //resize
        this.resizeHandler = () => {
            if (this.camera && this.renderer) {
                this.camera.resize();
                this.renderer.resize();
            }
        };

        //tick
        this.time = new Time();
        
        this.tickHandler = () => {
            this.camera.update();
            this.renderer.update();
        };
        
        this.sizes.on('resize', this.resizeHandler);
        this.time.on('tick', this.tickHandler);
    }
    
    destroy() {
       
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
