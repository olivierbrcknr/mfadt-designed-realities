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
  teapot: 0.02
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


// Materials

const material_vinylWhite = new THREE.MeshMatcapMaterial()
material_vinylWhite.matcap = matCap_porcelain
material_vinylWhite.side = THREE.DoubleSide


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

    // Renderers
    renderer_teapot.render(scene_teapot, camera_teapot)

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

  // Update renderer
  renderer_teapot.setSize(teapot_sizes.width, teapot_sizes.height)
  renderer_teapot.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
