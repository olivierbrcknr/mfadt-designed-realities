import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { material_metall, material_glass_wLight } from './../ownModules/materials'

let renderer = null;
let controls = null;
let scene = null
let gui = null
let folder = null

const objectsStatic = []

const init = ( actualRenderer, actualScene, camera, canvas, actualGui, gltfL, txL ) => {

  renderer = actualRenderer
  gui = actualGui
  folder = gui.addFolder('Objects')
  folder.open()
  scene = actualScene

  scene.background = new THREE.Color('#C66345');

  camera.position.x = 1;
  camera.position.y = 1.5;
  camera.position.z = 1;

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.target = new THREE.Vector3( 0.1, 1.2, 0 )

  controls.enablePan = false
  controls.enableZoom = true
  controls.minDistance = 0.3
  controls.maxDistance = 2

  controls.maxPolarAngle = Math.PI / 2

  const bakedTexture = txL.load('textures/objects.jpg')
  bakedTexture.flipY = false
  bakedTexture.encoding = THREE.sRGBEncoding

  const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

  renderer.outputEncoding = THREE.sRGBEncoding

  gltfL.load(
    "/objects/objects.glb",
    ( gltf ) => {

      gltf.scene.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          switch ( child.name ){
            case "glass_cube":
            case "glass_cylinder":
              child.material = material_glass_wLight
              break
            case "bake":
              child.material = bakedMaterial
              child.material.side = THREE.DoubleSide
              break
            case "caliper":
              child.material = material_metall
              break
          }
        }
      });

      objectsStatic.push( gltf.scene )

      scene.add( gltf.scene );
    }
  );

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
  directionalLight.position.x = 4
  directionalLight.position.y = 3.5
  directionalLight.position.z = -3

  scene.add(directionalLight)
  objectsStatic.push(directionalLight)

}

// Animations ————————————————————————————————————————————————————————

const tick = ( elapsedTime ) =>
{
  controls.update()
}

// Remove
const remove = () => {

  console.log('Remove Objects Scene')

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



const objectsScene = {
  init: init,
  tick: tick,
  remove: remove
}

export default objectsScene
