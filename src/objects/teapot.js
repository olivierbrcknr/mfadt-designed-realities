import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { material_porcelain } from './materials.js'


let renderer = null;
let object_teapot = null;
let controls = null;
let scene = null
let gui = null
let folder = null

const objectsStatic = []

const objectScales = {
  teapot: 0.02,
  wall: 20
}

const init = ( actualRenderer, actualScene, camera, canvas, actualGui, sizes, objL ) => {

  renderer = actualRenderer
  gui = actualGui
  folder = gui.addFolder('TeaPot')
  folder.isOpen = true
  scene = actualScene

  camera.position.y = 40;
  camera.position.z = 65;

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.enableZoom = false

  objL.load(
    "/objects/TeaPot.obj",
    ( object ) => {

      object_teapot = object;
      object.scale.set( objectScales.teapot,objectScales.teapot,objectScales.teapot );

      object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          child.material = material_porcelain
        }
      });

      objectsStatic.push(object)

      camera.lookAt(object.position)
      scene.add( object );
    }
  );

}

// Animations ————————————————————————————————————————————————————————

const tick = ( elapsedTime ) =>
{
  // Teapot
  if( object_teapot ){
    object_teapot.rotation.y = 0.15 * elapsedTime
    controls.update()
  }
}

// Remove
const remove = () => {

  console.log('Remove TeapotScene')

  controls.dispose()

  for( const object of objectsStatic ){
    scene.remove( object )
  }
  gui.removeFolder( folder )
}



const teapotScene = {
  init: init,
  tick: tick,
  remove: remove
}

export default teapotScene

