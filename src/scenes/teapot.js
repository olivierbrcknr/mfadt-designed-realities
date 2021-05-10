import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { material_porcelain } from './../ownModules/materials'


let renderer = null;
let object_teapot = null;
let controls = null;
let scene = null
let gui = null
let folder = null

const objectsStatic = []

const init = ( actualRenderer, actualScene, camera, canvas, actualGui, sizes, gltfL ) => {

  renderer = actualRenderer
  gui = actualGui
  folder = gui.addFolder('TeaPot')
  folder.open()
  scene = actualScene

  camera.position.y = 4;
  camera.position.z = 4;

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.enableZoom = false
  controls.autoRotate = true

  gltfL.load(
    "/objects/teapot.glb",
    ( gltf ) => {

      console.log( gltf )

      object_teapot = gltf.scene.children.find( o => o.name === "TeaPot" )
      object_teapot.material = material_porcelain

      objectsStatic.push( object_teapot )

      camera.lookAt( object_teapot.position )
      scene.add( object_teapot );
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

  console.log('Remove TeapotScene')

  controls.dispose()

  for( const object of objectsStatic ){
    scene.remove( object )
    // object.geometry.dispose()
    // object.material.dispose()
  }
  gui.removeFolder( folder )
}



const teapotScene = {
  init: init,
  tick: tick,
  remove: remove
}

export default teapotScene
