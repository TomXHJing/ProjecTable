import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 5, 9);
camera.lookAt(0, 0, 0); // Set the camera to look at the center of the scene


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
renderer.physicallyCorrectLights = true; // Enable light collision
renderer.shadowMap.enabled = true; // Enable shadow mapping
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 0);
light.castShadow = true; // Enable shadow casting for the light
scene.add(light);

const topLight = new THREE.HemisphereLight(0xffffff, 0x080820, 1); // Create a top light
scene.add(topLight);

const loader = new GLTFLoader();
let mesh;
loader.load('assets/models/desk.glb', function (gltf) {
    mesh = gltf.scene;
    mesh.scale.set(0.1, 0.1, 0.1);
    mesh.position.y = -1; // Lower the table
    scene.add(mesh);
});

let isReversed = false;
let rotationIncrement = 0.005;

function animate() {
    requestAnimationFrame(animate);
    if (mesh) {
        if (!isReversed) {
            mesh.rotation.y += rotationIncrement;
            if (mesh.rotation.y >= Math.PI) {
                isReversed = true;
            }
        } else {
            mesh.rotation.y -= rotationIncrement;
            if (mesh.rotation.y <= 0) {
                isReversed = false;
            }
        }
    }
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

animate();
