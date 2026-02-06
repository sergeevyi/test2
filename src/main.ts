import * as PIXI from 'pixi.js';
import * as THREE from 'three';
import { Game } from './game';

// Create Three.js scene for 3D models
const threeScene = new THREE.Scene();
const threeCamera = new THREE.PerspectiveCamera(
  75,
  800 / 600,
  0.1,
  1000
);
threeCamera.position.z = 30;

const threeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
threeRenderer.setSize(800, 600);
threeRenderer.setClearColor(0x000000, 0); // Transparent background

// Add Three.js canvas to DOM (behind PixiJS)
const container = document.getElementById('game-container');
if (container) {
  threeRenderer.domElement.style.position = 'absolute';
  threeRenderer.domElement.style.top = '0';
  threeRenderer.domElement.style.left = '0';
  threeRenderer.domElement.style.zIndex = '1';
  container.appendChild(threeRenderer.domElement);
}

// Add lighting for the 3D scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
threeScene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(10, 10, 10);
threeScene.add(directionalLight);

// Add another light from the front
const frontLight = new THREE.DirectionalLight(0xffffff, 0.5);
frontLight.position.set(0, 0, 10);
threeScene.add(frontLight);

// Create the PixiJS application (on top of Three.js)
const app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor: 0x5c94fc,
  backgroundAlpha: 0.3, // Much more transparent to see 3D model
  antialias: true,
});

// Add PixiJS canvas to DOM
if (container) {
  (app.view as HTMLCanvasElement).style.position = 'absolute';
  (app.view as HTMLCanvasElement).style.top = '0';
  (app.view as HTMLCanvasElement).style.left = '0';
  (app.view as HTMLCanvasElement).style.zIndex = '2';
  container.appendChild(app.view as HTMLCanvasElement);
}

// Create and start the game, passing the Three.js scene
const game = new Game(app, threeScene);

// Combined game loop
function animate() {
  requestAnimationFrame(animate);
  
  // Render Three.js scene
  threeRenderer.render(threeScene, threeCamera);
  
  // PixiJS updates via its own ticker
}

animate();

// PixiJS game loop
app.ticker.add((delta) => {
  game.update(delta);
});
