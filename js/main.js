//Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";

//Create a Three.JS Scene
const scene = new THREE.Scene();
//create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const blob = document.getElementById("blob");

//Keep track of the mouse position, so we can make the eye move
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

blob.style.left = mouseX;
blob.style.top = mouseY;

let halfScrW = window.innerWidth / 2;
let halfScrH = window.innerHeight / 2;

//Keep the 3D object on a global variable so we can access it later
let object;

//OrbitControls allow the camera to move around the scene
let controls;

//Set which object to render
let objToRender = 'sphere';

//Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

// Instantiate DRACOLoader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.129.0/examples/js/libs/draco/gltf/');

// Tell GLTFLoader to use DRACOLoader
loader.setDRACOLoader(dracoLoader);

// Load the file
loader.load(
  `models/${objToRender}/scene.glb`,
  function (gltf) {
    // If the file is loaded, add it to the scene
    object = gltf.scene;

    
    scene.add(object);
  },
  function (xhr) {
    // While it is loading, log the progress
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    // If there is an error, log it
    console.error(error);
  }
);

//Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); //Alpha: true allows for the transparent background
renderer.setSize(window.innerWidth, window.innerHeight);

//Add the renderer to the DOM
document.getElementById("container3D").appendChild(renderer.domElement);

//Set how far the camera will be from the 3D model
camera.position.z = 4.5;

//Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xd63449, 2); // (color, intensity)
topLight.position.set(500, 500, 500) //top-left-ish
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, objToRender === "dino" ? 5 : 1);
scene.add(ambientLight);

//This adds controls to the camera, so we can rotate / zoom it with the mouse
if (objToRender === "dino") {
  controls = new OrbitControls(camera, renderer.domElement);
}

//Render the scene
let currentPosX = 0;
let currentPosY = 0;

// Render the scene
const animate = () => {
  requestAnimationFrame(animate);

  // Make the sphere move and spin slowly
  if (object && objToRender === "sphere") {
    // Spin slowly horizontally
    object.rotation.y += 0.01;
    halfScrW = window.innerWidth / 2;
    halfScrH = window.innerHeight / 2;

    const targetRotationY = mouseY / window.innerHeight;
    const targetPosX = -(halfScrW - mouseX) / window.innerWidth;
    const targetPosY = (halfScrH - mouseY) / window.innerHeight;

    // interp
    currentPosX += (targetPosX - currentPosX) * 0.1;
    currentPosY += (targetPosY - currentPosY) * 0.1;

    object.position.x = currentPosX;
    object.position.y = currentPosY;
    object.rotation.x += (targetRotationY - object.rotation.x) * 0.05;
    object.rotation.y += 0.001;
  }
  renderer.render(scene, camera);
}

// Add a listener to the window, so we can resize the window and the camera
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add mouse position listener, so we can make the sphere move
window.onpointermove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;  
  requestAnimationFrame(animateBlob);
}

const animateBlob = () => {
  blob.animate({
    left: `${mouseX}px`,
    top: `${mouseY}px`
  }, { duration: 3000, fill: "forwards" });
}

const aboutUsContainer = document.getElementById("about-us-container");
const mhioraElements = document.querySelectorAll('.mhiora');

window.onscroll = () => {
  const scrollPosition = window.scrollY;
  const startScroll = window.innerHeight;
  const endScroll = window.innerHeight * 2;

  // scroll calculations
  let percent = (scrollPosition - startScroll) / (endScroll - startScroll) * 100;
  percent = Math.min(Math.max(percent, 0), 100); // clamp thingy

  if (scrollPosition >= 0 && scrollPosition < window.innerHeight / 2) {
    document.documentElement.style.filter = "hue-rotate(0deg)";
  } else if (scrollPosition >= window.innerHeight / 2 && scrollPosition < window.innerHeight * 2.5) {
    document.documentElement.style.filter = "hue-rotate(-80deg)";
  }

  if (scrollPosition > startScroll && scrollPosition <= endScroll) {
    aboutUsContainer.style.top = "0px";
    aboutUsContainer.style.position = "fixed";

    mhioraElements.forEach(mhioraElement => {
      mhioraElement.style.setProperty('--before-width', `${percent}%`);
    });
  } else if (scrollPosition > endScroll) {
    aboutUsContainer.style.top = "200vh";
    aboutUsContainer.style.position = "absolute";

    mhioraElements.forEach(mhioraElement => {
      mhioraElement.style.setProperty('--before-width', '100%');
    });
  } else {
    aboutUsContainer.style.top = "100vh";
    aboutUsContainer.style.position = "absolute";
    mhioraElements.forEach(mhioraElement => {
      mhioraElement.style.setProperty('--before-width', '0%');
    });
  }
};

// Start the 3D rendering
animate();
