import * as THREE from "three";

export default class Lights extends THREE.Group {
    constructor(scene) {
        super();

        this.scene = scene;

        // ==========================================
        // Ambient Light
        // ==========================================

        this.ambient = new THREE.AmbientLight(
            0xffffff,
            0.4
        );

        this.add(this.ambient);

        // ==========================================
        // Sun Light
        // ==========================================

        this.sun = new THREE.DirectionalLight(
            0xffffff,
            3
        );

        this.sun.position.set(8, 12, 8);

        this.sun.castShadow = true;

        // Shadow Quality
        this.sun.shadow.mapSize.set(2048, 2048);

        // Shadow Camera
        this.sun.shadow.camera.left = -8;
        this.sun.shadow.camera.right = 8;
        this.sun.shadow.camera.top = 8;
        this.sun.shadow.camera.bottom = -8;

        this.sun.shadow.camera.near = 1;
        this.sun.shadow.camera.far = 20;

        this.sun.shadow.bias = -0.0002;

        // Target
        this.sun.target.position.set(0, 0, 0);

        this.add(this.sun);

        // Target باید داخل Scene باشد
        scene.add(this.sun.target);

        this.sun.target.updateMatrixWorld();
        this.sun.shadow.camera.updateProjectionMatrix();
    }

    setPosition(x, y, z) {
        this.sun.position.set(x, y, z);
    }

    lookAt(x, y, z) {
        this.sun.target.position.set(x, y, z);
        this.sun.target.updateMatrixWorld();
    }

    enableHelper() {

        this.helper = new THREE.DirectionalLightHelper(
            this.sun,
            2
        );

        this.shadowHelper = new THREE.CameraHelper(
            this.sun.shadow.camera
        );

        this.scene.add(this.helper);
        this.scene.add(this.shadowHelper);
    }

    dispose() {

        if (this.helper) {
            this.scene.remove(this.helper);
            this.helper.dispose();
        }

        if (this.shadowHelper) {
            this.scene.remove(this.shadowHelper);
            this.shadowHelper.dispose();
        }

        this.scene.remove(this.sun.target);

        this.clear();
    }
}