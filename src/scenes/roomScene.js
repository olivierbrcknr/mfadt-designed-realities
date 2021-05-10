import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

let renderer = null;
let controls = null;
let scene = null
let gui = null
let folder = null

const objectsStatic = []

const init = ( actualRenderer, actualScene, camera, canvas, actualGui, gltfL, txL ) => {

  renderer = actualRenderer
  gui = actualGui
  folder = gui.addFolder('Room')
  folder.open()
  scene = actualScene

  scene.background = new THREE.Color('#BDBCB8');

  const bakedTexture = txL.load('textures/room.jpg')
  bakedTexture.flipY = false
  bakedTexture.encoding = THREE.sRGBEncoding

  const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

  const windowMaterial = new THREE.MeshBasicMaterial({ color: '#FFF' })

  renderer.outputEncoding = THREE.sRGBEncoding

  camera.position.y = 4;
  camera.position.z = 4;

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.enableZoom = true
  controls.enablePan = false

  controls.minDistance = 5
  controls.maxDistance = 10

  controls.maxPolarAngle = Math.PI / 2
  controls.maxAzimuthAngle = Math.PI / 2
  controls.minAzimuthAngle = 0

  gltfL.load(
    "/objects/room.glb",
    ( gltf ) => {

      const object = gltf.scene

      console.log( object )

      object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          if( child.name === 'window' ){
            child.material = windowMaterial
          }

          if( child.name === 'baked' ){
            child.material = bakedMaterial
          }
        }
      });

      objectsStatic.push(object)

      object.rotation.y = -Math.PI / 2

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

  console.log('Remove RoomScene')

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



const roomScene = {
  init: init,
  tick: tick,
  remove: remove
}

export default roomScene
