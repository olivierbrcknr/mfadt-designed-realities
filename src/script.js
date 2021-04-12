import './css/reset.css'
import './css/variables.css'
import './css/grid.css'
import './css/style.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import * as dat from 'dat.gui'

const isDev = (process.env.NODE_ENV === 'development')

// Debug
const gui = new dat.GUI()

if( !isDev ){
  gui.hide()
}

const objectScales = {
  teapot: 0.02,
  wall: 20
}

// Main Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// Loaders
const textureLoader = new THREE.TextureLoader()
const objLoader = new OBJLoader()

// Textures
const matCap_porcelain = textureLoader.load('/textures/matcaps/porcelain.jpg')

const matCap_vinyl_beige = textureLoader.load('/textures/matcaps/VinylBeige.jpg')

const matCap_vinyl_brown = textureLoader.load('/textures/matcaps/VinylBrown.jpg')

const matCap_vinyl_red = textureLoader.load('/textures/matcaps/VinylRed.jpg')

// Materials

const material_vinylWhite = new THREE.MeshMatcapMaterial()
material_vinylWhite.matcap = matCap_porcelain
material_vinylWhite.side = THREE.DoubleSide

const material_vinylBeige = new THREE.MeshMatcapMaterial()
material_vinylBeige.matcap = matCap_vinyl_beige

const material_vinylBrown = new THREE.MeshMatcapMaterial()
material_vinylBrown.matcap = matCap_vinyl_brown
material_vinylBrown.side = THREE.DoubleSide

const material_vinylRed = new THREE.MeshMatcapMaterial()
material_vinylRed.matcap = matCap_vinyl_red
material_vinylRed.side = THREE.DoubleSide


// Object one — Teapot —————————————————————————————————————————————

let guiTeapotFolder = gui.addFolder('TeaPot')

guiTeapotFolder.add(objectScales, 'teapot', 0, 0.1, 0.001).onChange(()=>{
  object_teapot.scale.set(objectScales.teapot,objectScales.teapot,objectScales.teapot)
})

const teapot_sizes = {
  width: sizes.width/2,
  height: 600
}

const canvas_teapot = document.querySelector('canvas.object-Teapot')

const scene_teapot = new THREE.Scene()

const camera_teapot = new THREE.PerspectiveCamera(45, teapot_sizes.width / teapot_sizes.height, 0.1, 100)
camera_teapot.position.y = 40;
camera_teapot.position.z = 65;
scene_teapot.add(camera_teapot)

// guiTeapotFolder.add(camera_teapot.position, 'z', 0, 10, 0.1).name('camera z')

const controls_teapot = new OrbitControls(camera_teapot, canvas_teapot)
controls_teapot.enableDamping = true
controls_teapot.enableZoom = false

const renderer_teapot = new THREE.WebGLRenderer({
  canvas: canvas_teapot,
  antialias: true,
  alpha: true,
})
renderer_teapot.setSize(teapot_sizes.width, teapot_sizes.height)
renderer_teapot.setPixelRatio(Math.min(window.devicePixelRatio, 2))

let object_teapot = null;

objLoader.load(
  "/objects/TeaPot.obj",
  ( object ) => {

    object_teapot = object;
    object.scale.set( objectScales.teapot,objectScales.teapot,objectScales.teapot );

    object.traverse( function ( child ) {
      if ( child instanceof THREE.Mesh ) {
        child.material = material_vinylWhite;
      }
    });

    camera_teapot.lookAt(object.position)

    scene_teapot.add( object );
  },
);


// Object two — Wall —————————————————————————————————————————————

const canvas_wall = document.querySelector('canvas.object-wall')

const wall_cursor = {
  x: 0,
  y: 0
}
canvas_wall.addEventListener( "mousemove", (event) => {
  wall_cursor.x = event.clientX / sizes.width - 0.5
  wall_cursor.y = - ( event.clientY / sizes.height - 0.5 )
} )


let guiWallFolder = gui.addFolder('Wall')

guiWallFolder.add(objectScales, 'wall', 10, 100, 0.01).onChange(()=>{
  object_wall.scale.set(objectScales.wall,objectScales.wall,objectScales.wall)
})

const wall_sizes = {
  width: sizes.width,
  height: 600,
  cameraY: 17,
  cameraMovement: 10
}


const scene_wall = new THREE.Scene()

const camera_wall = new THREE.PerspectiveCamera(22, wall_sizes.width / wall_sizes.height, 10, 200)
camera_wall.position.y = wall_sizes.cameraY;
camera_wall.position.z = 100;
scene_wall.add(camera_wall)

camera_wall.lookAt( new THREE.Vector3(0,17,0) )

console.log(camera_wall)
guiWallFolder.add(camera_wall.position, 'y', 10, 100, 0.01).name("Cam Y")
guiWallFolder.add(camera_wall, 'fov', 10, 100, 0.01).name("FOV").onChange(()=>{
  camera_wall.updateProjectionMatrix();
})
guiWallFolder.add(camera_wall, 'zoom', 0.01, 10, 0.01).name("Zoom").onChange(()=>{
  camera_wall.updateProjectionMatrix();
})

// const controls_wall = new OrbitControls(camera_wall, canvas_wall)
// controls_wall.enableDamping = true
// controls_wall.enableZoom = true

const renderer_wall = new THREE.WebGLRenderer({
  canvas: canvas_wall,
  antialias: true,
  alpha: true,
})
renderer_wall.setSize(wall_sizes.width, wall_sizes.height)
renderer_wall.setPixelRatio(Math.min(window.devicePixelRatio, 2))

let object_wall = null;

objLoader.load(
  "/objects/wall.obj",
  ( object ) => {

    object_wall = object;
    object.scale.set( objectScales.wall,objectScales.wall,objectScales.wall );

    object.traverse( function ( child ) {
      if ( child instanceof THREE.Mesh ) {
        switch( child.material.name ){
          case 'Highlight':
            child.material = material_vinylRed
            break;
          case 'Darker':
            child.material = material_vinylBrown
            break;
          default:
            child.material = material_vinylBeige
            break;
        }
      }
    });

    scene_wall.add( object );
  },
);


// Animations ————————————————————————————————————————————————————————

const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    if( object_teapot ){
      object_teapot.rotation.y = 0.15 * elapsedTime
    }

    // Controls
    controls_teapot.update()
    // controls_wall.update()

    // camera_wall.position.x = wall_cursor.x * wall_sizes.cameraMovement
    camera_wall.position.x = Math.sin( wall_cursor.x * Math.PI / 10 ) * 100
    camera_wall.position.z = Math.cos( wall_cursor.x * Math.PI / 10 ) * 100
    camera_wall.position.y = wall_cursor.y * wall_sizes.cameraMovement + wall_sizes.cameraY

    // Renderers
    renderer_teapot.render(scene_teapot, camera_teapot)
    renderer_wall.render(scene_wall, camera_wall)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


// Fix elements

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  teapot_sizes.width = sizes.width/2

  // Update cameras
  camera_teapot.aspect = teapot_sizes.width / teapot_sizes.height
  camera_teapot.updateProjectionMatrix()

  camera_wall.aspect = wall_sizes.width / wall_sizes.height
  camera_wall.updateProjectionMatrix()

  // Update renderer
  renderer_teapot.setSize(teapot_sizes.width, teapot_sizes.height)
  renderer_teapot.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  renderer_wall.setSize(wall_sizes.width, wall_sizes.height)
  renderer_wall.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
