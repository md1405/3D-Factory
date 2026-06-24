import * as THREE from "three";

export default class RaycasterManager {

    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.clickables = [];
        window.addEventListener(
            "click",
            this.onClick.bind(this)
        );
    }

    register(mesh) {
        this.clickables.push(mesh);
    }

    onClick(event) {
        this.mouse.x =
            (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y =
            -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(
            this.mouse,
            this.camera
        );

        const intersects =
            this.raycaster.intersectObjects(
                this.clickables,
                true // Searching for children
            );


        // No equipment clicked.
        if (intersects.length === 0) {

            if (this.onDeselect) {
                this.onDeselect();
            }

            return;
        }

        let object = intersects[0].object;

        while (
            object &&
            !object.userData.equipmentId &&
            object.parent
        ) {
            object = object.parent;
        }

        if (!object?.userData?.equipmentId) {

            if (this.onDeselect) {
                this.onDeselect();
            }

            return;
        }

        if (this.onSelect) {
            this.onSelect(object);
        }
    }
}