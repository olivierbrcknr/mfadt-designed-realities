import * as THREE from 'three'
import { material_vinylBeige, material_vinylBrown, material_vinylRed } from './materials.js'

let renderer = null;
let object_teapot = null;
let controls = null;
let scene = null
let gui = null
let folder = null
let cursor = null
let camera = null

const objectsStatic = []

const objectScales = {}
objectScales.wall = 3

const init = ( actualRenderer, actualScene, actualCamera, canvas, actualGui, sizes, gltfL, txL ) => {

  renderer = actualRenderer
  gui = actualGui
  folder = gui.addFolder('Wall')
  folder.open()
  scene = actualScene
  camera = actualCamera

  camera.position.x = 0;
  camera.position.y = 1;
  camera.position.z = 3;
  camera.lookAt( new THREE.Vector3( 0,2,0 ) )

  camera.fov = 30

  const bakedTexture = txL.load('textures/wall.jpg')
  bakedTexture.flipY = false
  bakedTexture.encoding = THREE.sRGBEncoding

  const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

  renderer.outputEncoding = THREE.sRGBEncoding

  gltfL.load(
    "/objects/wall.glb",
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

  scene.background = new THREE.Color('#CCC3B6');

}

// Animations ————————————————————————————————————————————————————————

const tick = ( elapsedTime ) =>
{
  // Wall
  if( cursor ){
    camera.position.x = Math.sin( cursor.x * Math.PI / 32 ) * 4
    camera.position.z = Math.cos( cursor.x * Math.PI / 32 ) * 4
    camera.position.y = cursor.y/2 + 1
    camera.lookAt( new THREE.Vector3( 0,0.75,0 ) )
  }
}

// Remove
const remove = () => {

  console.log('Remove WallScene')

  scene.background = null;

  camera.fov = 45

  renderer.outputEncoding = THREE.LinearEncoding

  for( const object of objectsStatic ){
    scene.remove( object )
  }
  gui.removeFolder( folder )
}

const onMouseMove = (cursorPos) => {
  cursor = cursorPos
}

const teapotScene = {
  init: init,
  tick: tick,
  remove: remove,
  mouseMove: onMouseMove
}

export default teapotScene

