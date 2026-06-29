// src/objects/Bottle.js
import * as THREE from 'three';

export default class Bottle extends THREE.Group {
    constructor() { 
        super();

        //  Materials 
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, 
            roughness: 0.4,
            transparent: false,
            opacity: 0.8 
        });
        
        const capMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3366ff, 
            roughness: 0.2,
            metalness: 0.3
        });

        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.8, 32);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0;   
        this.add(body);

        // Cap
        const capGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.15, 16);
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.position.y = 0.675; 
        this.add(cap);
        
        // Neck
        const neckGeometry = new THREE.CylinderGeometry(0.15, 0.25, 0.2, 16);
        const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
        neck.position.y = 0.5;
        this.add(neck);
    }
}