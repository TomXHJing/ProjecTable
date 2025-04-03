import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clickableObjects = [];

// (Optional) If you want to map each model to a specific page:
const modelLinks = {
  drone:   'drone.html',
  printer: 'printer.html',
  frame:   'frame.html',
  screenA: 'screenA.html',
  screenB: 'screenB.html',
  screenC: 'screenC.html',
};

init();
animate();

// ========== 1. INIT SCENE, CAMERA, RENDERER, LIGHTS, CONTROLS ==========
function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 5, 12);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Lights
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(0, 10, 10);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x080820, 0.8);
  scene.add(hemiLight);

  // OrbitControls for camera movement
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('click', onMouseClick);

  // ========== 2. LOAD ALL MODELS ==========
  loadRoom();       // We'll assume room is not clickable
  loadDrone();      // Possibly clickable
  loadPrinter();    // Possibly clickable
  loadFrame();      // Possibly clickable
  loadScreenA();    // Possibly clickable
  loadScreenB();
  loadScreenC();
}

// ========== 2A. LOAD ROOM (not clickable) ==========
function loadRoom() {
  const loader = new GLTFLoader();
  loader.load('assets/models/room.glb', (gltf) => {
    const room = gltf.scene;
    // Example positioning
    room.position.set(0, -1, 0);
    // We do NOT add to clickableObjects if we don't want it clickable
    scene.add(room);
  });
}

// ========== 2B. LOAD DRONE ==========
function loadDrone() {
  const loader = new GLTFLoader();
  loader.load('assets/models/drone.glb', (gltf) => {
    const drone = gltf.scene;
    drone.name = 'drone';
    // Example positioning
    drone.scale.set(0.15, 0.15, 0.15);
    drone.position.set(3, 1, 1);

    scene.add(drone);
    // Make it clickable if desired
    clickableObjects.push(drone);
  });
}

// ========== 2C. LOAD PRINTER ==========
function loadPrinter() {
  const loader = new GLTFLoader();
  loader.load('assets/models/printer.glb', (gltf) => {
    const printer = gltf.scene;
    printer.name = 'printer';
    printer.scale.set(0.2, 0.2, 0.2);
    printer.position.set(-3, 0, 0);

    scene.add(printer);
    clickableObjects.push(printer);
  });
}

// ========== 2D. LOAD FRAME ==========
function loadFrame() {
  const loader = new GLTFLoader();
  loader.load('assets/models/frame.glb', (gltf) => {
    const frame = gltf.scene;
    frame.name = 'frame';
    // Example positioning
    frame.scale.set(0.2, 0.2, 0.2);
    frame.position.set(2, 2, -2);

    scene.add(frame);
    clickableObjects.push(frame);
  });
}

// ========== 2E. LOAD SCREEN A ==========
function loadScreenA() {
  const loader = new GLTFLoader();
  loader.load('assets/models/screenA.glb', (gltf) => {
    const screenA = gltf.scene;
    screenA.name = 'screenA';
    screenA.scale.set(0.1, 0.1, 0.1);
    screenA.position.set(-2, 0, 0);

    scene.add(screenA);
    clickableObjects.push(screenA);
  });
}

// ========== 2F. LOAD SCREEN B ==========
function loadScreenB() {
  const loader = new GLTFLoader();
  loader.load('assets/models/screenB.glb', (gltf) => {
    const screenB = gltf.scene;
    screenB.name = 'screenB';
    screenB.scale.set(0.1, 0.1, 0.1);
    screenB.position.set(-1, 0, 0);

    scene.add(screenB);
    clickableObjects.push(screenB);
  });
}

// ========== 2G. LOAD SCREEN C ==========
function loadScreenC() {
  const loader = new GLTFLoader();
  loader.load('assets/models/screenC.glb', (gltf) => {
    const screenC = gltf.scene;
    screenC.name = 'screenC';
    screenC.scale.set(0.1, 0.1, 0.1);
    screenC.position.set(0, 0, 0);

    scene.add(screenC);
    clickableObjects.push(screenC);
  });
}

// ========== 3. ANIMATE / RENDER LOOP ==========
function animate() {
  requestAnimationFrame(animate);

  // Update OrbitControls each frame
  controls.update();

  renderer.render(scene, camera);
}

// ========== 4. HANDLE WINDOW RESIZE ==========
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ========== 5. CLICK HANDLING (RAYCAST) ==========
function onMouseClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableObjects, true);

  if (intersects.length > 0) {
    const clickedObj = intersects[0].object;

    // In case the loaded GLTF has nested groups, get the top-level parent
    let topParent = clickedObj;
    while (topParent.parent && topParent.parent !== scene) {
      topParent = topParent.parent;
    }

    console.log('Clicked:', topParent.name);
    
    // If you mapped it in modelLinks, go to that page
    const link = modelLinks[topParent.name];
    if (link) {
      // If it's a local link: window.location.href = link
      // Or external link: window.open(link, '_blank')
      window.location.href = link;
    }
  }
}
