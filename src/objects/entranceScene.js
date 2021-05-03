import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


let renderer = null;
let object_teapot = null;
let controls = null;
let scene = null
let gui = null
let folder = null

const objectsStatic = []

const init = ( actualRenderer, actualScene, camera, canvas, actualGui, gltfL, txL ) => {

  renderer = actualRenderer
  gui = actualGui
  folder = gui.addFolder('Entrance')
  folder.open()
  scene = actualScene

  scene.background = new THREE.Color('#E46240');

  camera.position.x = 3;
  camera.position.y = 3;
  camera.position.z = 3;

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true

  controls.target = new THREE.Vector3( 0, 1, 0 )

  controls.enableZoom = true
  controls.minZoom = 1
  controls.maxZoom = 3

  controls.maxPolarAngle = Math.PI / 2 
  controls.maxAzimuthAngle = Math.PI / 2
  controls.minAzimuthAngle = 0

  const bakedTexture = txL.load('textures/entrance.jpg')
  bakedTexture.flipY = false
  bakedTexture.encoding = THREE.sRGBEncoding

  const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

  renderer.outputEncoding = THREE.sRGBEncoding

  gltfL.load(
    "/objects/entrance.glb",
    ( gltf ) => {

      const object = gltf.scene

      console.log( object )

      object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          child.material = bakedMaterial
        }
      });
      // object.material = bakedMaterial

      objectsStatic.push(object)

      scene.add( object );
    }
  );

}

// Animations ————————————————————————————————————————————————————————

const tick = ( elapsedTime ) =>
{
  controls.update()
}

// Remove
const remove = () => {

  console.log('Remove Entrance Scene')

  controls.dispose()
  scene.background = null;

  renderer.outputEncoding = THREE.LinearEncoding

  for( const object of objectsStatic ){
    scene.remove( object )
    // object.geometry.dispose()
    // object.material.dispose()
  }
  gui.removeFolder( folder )
}



const museumScene = {
  init: init,
  tick: tick,
  remove: remove
}

export default museumScene

