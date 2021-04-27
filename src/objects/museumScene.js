import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


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
  folder = gui.addFolder('Museum')
  folder.open()
  scene = actualScene

  scene.background = new THREE.Color('#000');

  camera.position.x = 3;
  camera.position.y = 3;
  camera.position.z = 3;

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.enableZoom = false
  controls.target = new THREE.Vector3( 0, 1, 0 )

  controls.maxPolarAngle = Math.PI / 2 

  gltfL.load(
    "/objects/museum.gltf",
    ( gltf ) => {

      const object = gltf.scene

      object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          child.castShadow = true
          child.receiveShadow = true
        }
      });

      objectsStatic.push(object)

      scene.add( object );
    }
  );

  // Lights
  // const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1)
  // folder.add(ambientLight, 'intensity').min(0).max(100).step(0.01).name("A intesnity ")
  // scene.add(ambientLight)
  // objectsStatic.push( ambientLight )

  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const pointLight = new THREE.PointLight( 0xffffff, 5, 7 )
  pointLight.position.set( 1, 4, 1 )
  pointLight.castShadow = true
  pointLight.shadow.normalBias = 0.1
  pointLight.shadow.radius = 3
  pointLight.shadow.mapSize.width = 1024
  pointLight.shadow.mapSize.height = 1024
  scene.add( pointLight )
  objectsStatic.push( pointLight )

  folder.add(pointLight.position, 'x', 0, 20, 0.01).name('Pointlight X')
  folder.add(pointLight.position, 'y', 0, 20, 0.01).name('Pointlight Y')
  folder.add(pointLight.position, 'z', 0, 20, 0.01).name('Pointlight Z')

  folder.add(pointLight, 'intensity', 0, 20, 0.01).name('Pointlight intensity')
  folder.add(pointLight, 'distance', 0, 100, 0.01).name('Pointlight Distance')

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

  for( const object of objectsStatic ){
    scene.remove( object )
  }
  gui.removeFolder( folder )
}



const museumScene = {
  init: init,
  tick: tick,
  remove: remove
}

export default museumScene

