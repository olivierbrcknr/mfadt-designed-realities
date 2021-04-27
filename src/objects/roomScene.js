import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { material_vinylBeige } from './materials.js'


let renderer = null;
let object_teapot = null;
let controls = null;
let scene = null
let gui = null
let folder = null

const objectsStatic = []

const init = ( actualRenderer, actualScene, camera, canvas, actualGui, gltfL ) => {

  renderer = actualRenderer
  gui = actualGui
  folder = gui.addFolder('Room')
  folder.open()
  scene = actualScene

  scene.background = new THREE.Color('#CCC3B6');

  camera.position.y = 4;
  camera.position.z = -4;

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.enableZoom = false

  gltfL.load(
    "/objects/room.gltf",
    ( gltf ) => {

      const object = gltf.scene

      object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {

          child.castShadow = true
          child.receiveShadow = true
          child.material = material_vinylBeige
        }
      });

      objectsStatic.push(object)

      scene.add( object );
    }
  );

  // Lights
  const ambientLight = new THREE.AmbientLight(0xCCC3B6, 0.7)
  folder.add(ambientLight, 'intensity').min(0).max(1).step(0.01).name("A intesnity ")
  scene.add(ambientLight)
  objectsStatic.push( ambientLight )

  const directionalLight = new THREE.DirectionalLight(0xFFFFFF,0.8)
  directionalLight.position.set(4,3,-3)

  folder.add(directionalLight, 'intensity').min(0).max(1).step(0.01).name("intesnity direction")
  folder.add(directionalLight.position, 'x').min(-10).max(10).step(0.1).name('Light X')
  folder.add(directionalLight.position, 'y').min(-10).max(10).step(0.1).name('Light Y')
  folder.add(directionalLight.position, 'z').min(-10).max(10).step(0.1).name('Light Z')

  scene.add(directionalLight)
  objectsStatic.push( directionalLight )

  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.normalBias = 0.1 // round surfaces

  directionalLight.shadow.camera.near = 1
  directionalLight.shadow.camera.far = 17
  directionalLight.shadow.camera.left = -5
  directionalLight.shadow.camera.top = 5
  directionalLight.shadow.camera.right = 8
  directionalLight.shadow.camera.bottom = -2


  const directionalLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
  scene.add(directionalLightHelper)
  directionalLightHelper.visible = false
  folder.add(directionalLightHelper, 'visible').name('ShadowCam')

  objectsStatic.push( directionalLightHelper )
    
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

  for( const object of objectsStatic ){
    scene.remove( object )
  }
  gui.removeFolder( folder )
}



const roomScene = {
  init: init,
  tick: tick,
  remove: remove
}

export default roomScene

