import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

let moveSpeed = 0.1;

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

document.onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

let menu_position = new THREE.Vector3(7.4,6.4,-10);
let menu_rotation = new THREE.Vector3(0,0,0);

let clock = new THREE.Clock();
let delta = 0;

let lerping = false;
let lerp_step = 0;
let lerp_total_time = 1.75;
let lerp_start_pos;
let lerp_start_rot;
let lerp_rotation = new THREE.Vector3();

let object;
let objToRender = 'arcade_outside';

let font;

const loader = new GLTFLoader();
const f_loader = new FontLoader();

f_loader.load(
    'fonts/roboto.ttf',
    function (font_i) {
        font = font_i;
    }
);

loader.load(
    `models/${objToRender}.glb`,
    function (gltf) {
        object = gltf.scene;
        scene.add(object);
    },undefined,
    // function (xhr) {
    //   console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    //},
    function (error) {
        console.error(error);
    }
);

document.getElementById("container3D").appendChild(renderer.domElement);

const topLight = new THREE.DirectionalLight(0xffffff, 6);
topLight.position.set(500, 500, 500)
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);

function loop() {
    requestAnimationFrame(loop);

    delta = clock.getDelta();

    if (lerping) {
        if (!lerp_start_pos) {
            lerp_start_pos = camera.position.clone();
            lerp_start_rot = camera.rotation.clone();
        }

        camera.position.lerpVectors(lerp_start_pos, menu_position, lerp_step);
        lerp_rotation.lerpVectors(lerp_start_rot, menu_rotation, lerp_step);

        camera.rotation.setFromVector3(lerp_rotation);

        lerp_step += delta / lerp_total_time;

        if (lerp_step > 1) {
            lerping = false;
            lerp_step = 0;
        }
    }
    else {
        // use orbit code or orbit control
    }

    renderer.render(scene, camera);
}

loop();

function move_around(e,object_to_move) {
  e = e || window.event;

  if (e.key === ';') {
    let vec = new THREE.Vector3( (mouseX / window.innerWidth) * 2 - 1, - (mouseY / window.innerHeight) * 2 + 1, 0.5);
    let pos = new THREE.Vector3();

    vec.unproject(camera);
    vec.sub(camera.position).normalize();

    var distance = - camera.position.z / vec.z;
    pos.copy(camera.position).add(vec.multiplyScalar(distance));

    console.log(pos);
  }

  if (e.key === 'y') {
    lerping = true;
  }

  if (e.key === 'w') {
    object_to_move.position.z -= moveSpeed;
  }
  else if (e.key === 's') {
    object_to_move.position.z += moveSpeed;
  }

  if (e.key === 'a') {
    object_to_move.position.x += moveSpeed;
  }
  else if (e.key === 'd') {
    object_to_move.position.x -= moveSpeed;
  }

  if (e.key === 'q') {
    object_to_move.position.y += moveSpeed;
  }
  else if (e.key === 'e') {
    object_to_move.position.y -= moveSpeed;
  }

  if (e.key === 'u') {
    object_to_move.rotation.x += moveSpeed;
  }
  else if (e.key === 'o') {
    object_to_move.rotation.x -= moveSpeed;
  }

  if (e.key === 'j') {
    object_to_move.rotation.y += moveSpeed;
  }
  else if (e.key === 'l') {
    object_to_move.rotation.y -= moveSpeed;
  }

  if (e.key === 'i') {
    object_to_move.rotation.z += moveSpeed;
  }
  else if (e.key === 'k') {
    object_to_move.rotation.z -= moveSpeed;
  }

  if (e.key === 'p') {
    console.log(object_to_move.rotation);
    console.log(object_to_move.position);
  }
}

document.onkeydown = function(e) {
    move_around(e, camera);
}

window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

camera.position.copy(menu_position);

const geometry = new TextGeometry('Hello World!', {
    font: font,
    size: 80,
    depth: 5,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 10,
    bevelSize: 8,
    bevelOffset: 0,
    bevelSegments: 5
})