import * as THREE from 'three'

export default class AxisGridHelper {
    constructor(node, units = 10) {
        if (!node || !(node instanceof THREE.Object3D)) {
            throw new Error('node must be a valid THREE.Object3D');
        }
        if (!Number.isFinite(units) || units <= 0) {
            throw new Error('units must be a positive finite number');
        }

        const axes = new THREE.AxesHelper(units);
        axes.material.depthTest = false;
        axes.renderOrder = 2;
        axes.visible = false;  
        node.add(axes);

        // Grid
        const grid = new THREE.GridHelper(units, units);
        grid.material.depthTest = false;
        grid.renderOrder = 1;
        grid.visible = false;
        node.add(grid);

        this.grid = grid;
        this.axes = axes;
        
        this._onNodeRemoved = () => this.dispose();
        node.addEventListener('removed', this._onNodeRemoved);
    }

    get visible() {
        return this.grid.visible;
    }

    set visible(v) {
        this.grid.visible = v;
        this.axes.visible = v;
    }

    dispose() {
        if (this._onNodeRemoved && this.grid.parent) {
            this.grid.parent.removeEventListener('removed', this._onNodeRemoved);
        }
        
        if (this.axes) {
            this.axes.material.dispose();
            this.axes.geometry.dispose();
            if (this.axes.parent) {
                this.axes.parent.remove(this.axes);
            }
        }
        
        if (this.grid) {
            this.grid.material.dispose();
            this.grid.geometry.dispose();
            if (this.grid.parent) {
                this.grid.parent.remove(this.grid);
            }
        }
    }
}