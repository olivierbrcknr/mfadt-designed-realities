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
  folder = gui.addFolder('Museum')
  folder.open()
  scene = actualScene

  scene.background = new THREE.Color('#000');

  camera.position.x = 3;
  camera.position.y = 3;
  camera.position.z = 3;

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.target = new THREE.Vector3( 0, 1, 0 )

  controls.enableZoom = true
  controls.minDistance = 1
  controls.maxDistance = 5

  controls.maxPolarAngle = Math.PI / 2

  const bakedTexture = txL.load('textures/museum.jpg')
  bakedTexture.flipY = false
  bakedTexture.encoding = THREE.sRGBEncoding

  const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

  renderer.outputEncoding = THREE.sRGBEncoding

  gltfL.load(
    "/objects/museum.glb",
    ( gltf ) => {


      const object = gltf.scene.children.find((child) => child.name === 'baked')

      // object.traverse( function ( child ) {
      //   if ( child instanceof THREE.Mesh ) {
      //     child.castShadow = true
      //     child.receiveShadow = true
      //   }
      // });
      object.material = bakedMaterial

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

  console.log('Remove Museum Scene')

  controls.dispose()
  scene.background = null;

  renderer.outputEncoding = THREE.LinearEncoding

  for( const object of objectsStatic ){
    scene.remove( object )
    object.geometry.dispose()
    object.material.dispose()
  }
  gui.removeFolder( folder )
}



const museumScene = {
  init: init,
  tick: tick,
  remove: remove
}

export default museumScene
