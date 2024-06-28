import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { rotate } from "three/examples/jsm/nodes/Nodes.js";

// I had to learn 3.js for this don't judge my code pls!!

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let moveSpeed = 0.5;
let rotateSpeed = Math.PI / 32;
let clock = new THREE.Clock();
let delta = 0;

let mouseX;
let mouseY;

let lerping = false;
let lerp_step = 0;
let lerp_total_time = 1;
let lerp_start = "arcade_start";
let lerp_end = "arcade_step_1";
let lerp_rotation = new THREE.Vector3();

let positions = {
  "arcade_start" : [new THREE.Vector3(-5.9,1,0.5), new THREE.Vector3(0,4,0)],
  "arcade_step_1" : [new THREE.Vector3(-4.2,1,2.4), new THREE.Vector3(0,3.5,0)],
  "arcade_step_final": [new THREE.Vector3(-4,1,2.9), new THREE.Vector3(0.4,3.1,0)]
}

let object;
let objToRender = 'arcade';

const loader = new GLTFLoader();

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

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById("container3D").appendChild(renderer.domElement);

const topLight = new THREE.DirectionalLight(0xffffff, 6);
topLight.position.set(500, 500, 500)
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);

function animate() {
  requestAnimationFrame(animate);

  delta = clock.getDelta();

  if (gameRunning) {
    currentGame(delta);
  }
  else if ('r' in keys){

    // I'm pretty sure I should do this, if I don't it would probably lag a ton
    
    let values = Object.values(gameMemory);
    for (let i = 0; i < values.length; i++) {
      if (values[i].hasOwnProperty("length")) {
        for (let j = 0; j < values[i].length; j++) {
          if (values[i][j] instanceof THREE.Mesh) {
            scene.remove(values[i][j]);
          }

          if (values[i][j].hasOwnProperty("dispose")) {
            values[i][j].dispose();
          }
        }
      }
      else if (values[i].hasOwnProperty("dispose")) {
        values[i].dispose();
      }
      else if (values[i] instanceof THREE.Mesh) {
        scene.remove(values[i]);
      }
    }

    gameMemory = {};

    gameRunning = true;
  }

  if (lerping) {

    camera.position.lerpVectors(positions[lerp_start][0], positions[lerp_end][0], lerp_step);
    lerp_rotation.lerpVectors(positions[lerp_start][1], positions[lerp_end][1], lerp_step);

    camera.rotation.setFromVector3(lerp_rotation);

    lerp_step += delta / lerp_total_time;

    if (lerp_step >= 1) {
      lerping = false;
      lerp_step = 0;
      // camera.position.copy(positions[lerp_end][0]);
      // camera.rotation.setFromVector3(positions[lerp_end][1]);
      if (lerp_end === 'arcade_step_1') {
        lerp_start = 'arcade_step_1';
        lerp_end = 'arcade_step_final';
        lerp_total_time = 0.5;
      }
    }
  }

  renderer.render(scene, camera);
}

function move_around(e,object_to_move) {
  e = e || window.event;

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

function move_geometry(e,geometry) {
  let xsp = (e.key === 'd') - (e.key === 'a');
  let ysp = (e.key === 'e') - (e.key === 'q');
  let zsp = (e.key === 'w') - (e.key === 's');
  
  let xrt = (e.key === 'l') - (e.key === 'j');
  let yrt = (e.key === 'o') - (e.key === 'u');
  let zrt = (e.key === 'i') - (e.key === 'k');

  if (e.key === 'm') {
    console.log(geometry);
  }

  geometry.translate(xsp * moveSpeed,ysp * moveSpeed,zsp * moveSpeed);
  geometry.rotateX(xrt * rotateSpeed,yrt * rotateSpeed,zrt * rotateSpeed);
}

let keys = {};

function log_key_down(e) {

  let key = e.key.toLowerCase();

  if (!(key in keys)) {
    keys[key] = true;
  }

}

function log_key_up(e) {

  let key = e.key.toLowerCase();

  if (key in keys) {
    delete keys[key];
  }
}

document.onkeydown = function(e) {
  move_around(e, camera);
  if (e.key === 'y') {
    lerping = true;
  }
  else if (e.key === 'v') {
    moveSpeed /= 10;
    rotateSpeed /= 10;
  }
  else if (e.key === 'b') {
    moveSpeed *= 10;
    rotateSpeed *= 10;
  }
  // move_geometry(e, geometry);
  log_key_down(e);
}

document.onkeyup = function(e) {
  log_key_up(e);
}

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.onmousemove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}

let gameMemory = {};
let currentGame = snake;
let gameRunning = true;
// const plane = new THREE.Plane(new THREE.Vector3(0,0,0), 0);
// const helper = new THREE.PlaneHelper(plane, 1, 0xffffff);
// scene.add(helper);

const geometry = new THREE.BufferGeometry();

const vertices = new Float32Array(
  [
    // 0,0,0,
    // 0,100,0,
    // 100,100,0,

    // 0,0,0,
    // 100,0,0,
    // 100,100,0

    // -3.8602, -3.397,  1.0515,
    // -3.8602, -3.2244, 0.75611,
    // -4.2208, -3.397,  1.0515,

    // -4.2208, -3.397,  1.0515,
    // -3.8602, -3.2244, 0.75611,
    // -4.2208, -3.2244, 0.75611

    -3.8602, 1.0512, 3.3917,
    -3.8602, 0.758967, 3.213928,
    -4.2208, 1.051259, 3.391720,

    -4.2208, 1.051259, 3.391720,
    -3.8602, 0.758967, 3.213928,
    -4.2208, 0.758967, 3.213928,
  ]);

//geometry.rotateY(Math.PI);

camera.position.copy(positions['arcade_start'][0]);
camera.rotation.setFromVector3(positions['arcade_start'][1]);

geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
const material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
const mesh = new THREE.Mesh(geometry, material);

const pixel = new THREE.BufferGeometry();

// the dimensions vec3 is just the range of each dimension in the vertices array
// float point errors might make this not work?

const dimensions = new THREE.Vector3(-0.3606, 0.292292, 0.177792);

var verts;

function recalculate_pixel(pixels_on_x=15.0,pixels_on_y=15.0,gameMemory) {

  gameMemory["unit_x"] = dimensions.x / pixels_on_x;
  gameMemory["unit_y"] = dimensions.y / pixels_on_y;
  let unit_z = 0 // I THINK IT SHOULD BE ZERO. (unit_x + unit_y) / 2; // ??? Do i need to have unit_z ???

  verts = new Float32Array([
      0,0,unit_z,
      gameMemory["unit_x"],0,unit_z,
      gameMemory["unit_x"],gameMemory["unit_y"],unit_z,

      gameMemory["unit_x"],gameMemory["unit_y"],unit_z,
      0,gameMemory["unit_y"],unit_z,
      0,0,unit_z
  ]);

  for (let i = 0; i < verts.length; i++) {
    verts[i] += vertices[i];
  }

  pixel.setAttribute('position', new THREE.BufferAttribute(verts, 3));

  return gameMemory;
}

scene.add(mesh);

function snake(delta) {
  if (!('setup' in gameMemory)) {
    gameMemory['setup'] = true;
    // setup code here



    gameMemory['snakeCoords'] = [0,0];
    gameMemory['n_squares'] = 15.0;
    gameMemory = recalculate_pixel(gameMemory['n_squares'], gameMemory['n_squares'], gameMemory);
    // gameMemory['unit'] = (-3.806 + 4.2208) / gameMemory['n_squares'];

    // there's two ways I can think to do this:
    // one is make an individual plane for each snake segment, which sounds both slow and intesive
    // or make less planes using Buffers which should probably be less intesive

    gameMemory['snakeColor'] = new THREE.MeshBasicMaterial( {color: 0x4287f5} );
    gameMemory['appleColor'] = new THREE.MeshBasicMaterial( {color: 0xf55142} );

    let unit = gameMemory['unit_x'];

    // const unit_square = new THREE.BufferGeometry();
    // const verts = new Float32Array([
    //   // -3.806,1.0512,3.3917 + unit,
    //   // -3.8602 + unit,0.758967,3.213928 + unit,
    //   // -4.2208 + unit,1.051259 + unit,3.391720 + unit,

    //   // -4.2208 + unit,1.051259 + unit,3.391720 + unit,
    //   // -3.8602,0.758967 + unit,3.213928 + unit,
    //   // -4.2208,0.758967,3.213928 + unit
    //   // 0,0,unit,
    //   // unit,0,unit,
    //   // unit,unit,unit,

    //   // unit,unit,unit,
    //   // 0,unit,unit,
    //   // 0,0,unit
    // //   -3.8602, 1.0512, 3.3917,
    // // -3.8602, 0.758967, 3.213928,
    // // -4.2208, 1.051259, 3.391720,

    // // -4.2208, 1.051259, 3.391720,
    // // -3.8602, 0.758967, 3.213928,
    // // -4.2208, 0.758967, 3.213928,
    //   -3.8602, 1.0512, 3.3917,
    //   -3.8602, 0.758967, 3.213928,
    //   -4.2208, 1.051259, 3.391720,
    // ]);

    // verts = vertices

    // unit_square.setAttribute('position', new THREE.BufferAttribute(verts, 3));

    console.log(pixel);
    console.log(gameMemory["unit_x"])

    gameMemory['snakeSegmentMesh'] = [];
    gameMemory['snakeSegmentVectors'] = [];

    for (let i = 0; i < 3; i++) {
      let buff_tmp = new THREE.BufferGeometry().copy(pixel);
      buff_tmp.translate(-1 + unit * i,1,1 - unit);
      gameMemory['snakeSegmentVectors'].push(new THREE.Vector2(i,0));
      let mesh_tmp = new THREE.Mesh( buff_tmp, gameMemory['snakeColor'] );
      //mesh.add(mesh_tmp);
      scene.add(mesh_tmp);
      
      gameMemory['snakeSegmentMesh'].push(mesh_tmp);
    }

    gameMemory['horiz'] = true;
    gameMemory['hsp'] = 1;
    gameMemory['vsp'] = 0;

    gameMemory['appleMesh'] = new THREE.Mesh(new THREE.BufferGeometry().copy(pixel).translate(-1+unit * 5,1+unit * 4,1-unit),gameMemory['appleColor']);
    scene.add(gameMemory['appleMesh']);

    gameMemory['appleVector'] = new THREE.Vector2(5,4);

    gameMemory['counter'] = delta;

    // return to not run the draw code
    return;
  }

  gameMemory['counter'] += delta;

  if (gameMemory['horiz'] && (('arrowup' in keys) || ('w' in keys))) {
    gameMemory['vsp'] = 1;
    gameMemory['hsp'] = 0;
  }
  else if (gameMemory['horiz'] && (('arrowdown' in keys) || ('s' in keys))) {
    gameMemory['vsp'] = -1;
    gameMemory['hsp'] = 0;
  }
  else if (!gameMemory['horiz'] && (('arrowright' in keys) || ('d' in keys))) {
    gameMemory['hsp'] = 1;
    gameMemory['vsp'] = 0;
  }
  else if (!gameMemory['horiz'] && (('arrowleft' in keys) || ('a' in keys))) {
    gameMemory['hsp'] = -1;
    gameMemory['vsp'] = 0;
  }

  if (gameMemory['counter'] > 0.25) {
    gameMemory['counter'] = 0;

    let init_head = gameMemory['snakeSegmentVectors'][gameMemory['snakeSegmentVectors'].length - 1].clone();
    init_head.add(new THREE.Vector2(gameMemory['hsp'], gameMemory['vsp']));

    if (init_head.x > 14 || init_head.x < 0 || init_head.y > 6 || init_head.y < -7) {
      gameRunning = false;
      return;
    }

    for (let i = 0; i < gameMemory['snakeSegmentMesh'].length - 1; i++) {
      gameMemory['snakeSegmentMesh'][i].geometry.copy(gameMemory['snakeSegmentMesh'][i + 1].geometry);

      let new_loc = gameMemory['snakeSegmentVectors'][i + 1];

      gameMemory['snakeSegmentVectors'][i].set(new_loc.x,new_loc.y);
    }

    gameMemory['snakeSegmentMesh'][gameMemory['snakeSegmentMesh'].length - 1].geometry.translate(gameMemory['unit'] * gameMemory['hsp'], gameMemory['unit'] * gameMemory['vsp'], 0);

    let head_vec = gameMemory['snakeSegmentVectors'][gameMemory['snakeSegmentVectors'].length - 1];

    gameMemory['snakeSegmentVectors'][gameMemory['snakeSegmentVectors'].length - 1] = head_vec.add(new THREE.Vector2(gameMemory['hsp'],gameMemory['vsp']));

    for (let i = 0; i < gameMemory['snakeSegmentVectors'].length - 1; i++) {
      if (head_vec.equals(gameMemory['snakeSegmentVectors'][i])) {
        gameRunning = false;
        return;
      }
    }

    // collisions

    let apple_vec = gameMemory['appleVector'];

    if (apple_vec.equals(head_vec)) {

      let sign = Math.pow(-1,Math.floor(Math.random() * 2));
      let tmp_pos = new THREE.Vector2(Math.floor(Math.random() * (gameMemory['n_squares'])),Math.floor(Math.random() * ( gameMemory['n_squares'] + 1) / 2) * sign + (sign * -1));
      // gameMemory['appleMesh'].geometry.set(apple_vec.x,apple_vec.y,1 - gameMemory['unit']);
      let apple_buff = gameMemory['appleMesh'].geometry;
      apple_buff.translate((tmp_pos.x - apple_vec.x) * gameMemory['unit'], (tmp_pos.y - apple_vec.y) * gameMemory['unit'],0);

      gameMemory['appleVector'] = tmp_pos;

      // let mesh_tmp = new THREE.Mesh().copy(gameMemory['snakeSegmentMesh'][0]);
      let mesh_tmp = new THREE.Mesh(gameMemory['snakeSegmentMesh'][0].geometry.clone(), gameMemory['snakeColor']);
      scene.add(mesh_tmp);

      gameMemory['snakeSegmentMesh'].splice(0, 0, mesh_tmp);
      gameMemory['snakeSegmentVectors'].splice(0, 0, gameMemory['snakeSegmentVectors'][0].clone());
      // gameMemory['snakeSegmentVectors'].splice(0, 0, new THREE.Vector2(1,1));
    }

    gameMemory['horiz'] = gameMemory['hsp'] != 0
  }

}

animate();