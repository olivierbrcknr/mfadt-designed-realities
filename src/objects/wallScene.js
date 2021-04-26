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

const init = ( actualRenderer, actualScene, actualCamera, canvas, actualGui, sizes, txL, objL ) => {

  renderer = actualRenderer
  gui = actualGui
  folder = gui.addFolder('Wall')
  folder.isOpen = true
  scene = actualScene
  camera = actualCamera

  
  // Textures
  const matCap_porcelain = txL.load('/textures/matcaps/porcelain.jpg')

  // Materials
  const material_vinylWhite = new THREE.MeshMatcapMaterial()
  material_vinylWhite.matcap = matCap_porcelain
  material_vinylWhite.side = THREE.DoubleSide

  camera.position.x = 0;
  camera.position.y = 3;
  camera.position.z = 10;
  camera.lookAt( new THREE.Vector3( 0,2,0 ) )


  folder.add(camera.position, 'y', 0, 10, 0.01).name("Cam Y")
  folder.add(camera.position, 'z', 1, 100, 0.01).name("Cam Z")
  folder.add(camera, 'fov', 1, 100, 0.01).name("FOV").onChange(()=>{
    camera.updateProjectionMatrix();
  })
  folder.add(camera, 'zoom', 0.01, 10, 0.01).name("Zoom").onChange(()=>{
    camera.updateProjectionMatrix();
  })

  objL.load(
    "/objects/wall.obj",
    ( object ) => {

      object.scale.set( objectScales.wall,objectScales.wall,objectScales.wall );

      object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {

          child.castShadow = true
          child.receiveShadow = true

          switch( child.material.name ){
            case 'Highlight':
              child.material = material_vinylRed
              break;
            case 'Darker':
              child.material = material_vinylBrown
              break;
            default:
              child.material = material_vinylBeige
              break;
          }
          // console.log(child)
        }
      });

      scene.add( object );
      objectsStatic.push( object )
    },
  );

  // Lights
  const wall_ambientLight = new THREE.AmbientLight(0xCCC3B6, 0.7)
  // ambientLight.color = new THREE.Color(0xff0000)
  // ambientLight.intensity = 0.5
  folder.add(wall_ambientLight, 'intensity').min(0).max(1).step(0.01).name("A intesnity ")
  scene.add(wall_ambientLight)
  objectsStatic.push( wall_ambientLight )

  const wall_directionalLight = new THREE.DirectionalLight(0xFFFFFF,0.8)
  wall_directionalLight.position.set(5,5,6)

  folder.add(wall_directionalLight, 'intensity').min(0).max(1).step(0.01).name("intesnity direction")
  folder.add(wall_directionalLight.position, 'x').min(0).max(10).step(0.1).name('Light X')
  folder.add(wall_directionalLight.position, 'y').min(0).max(10).step(0.1).name('Light Y')
  folder.add(wall_directionalLight.position, 'z').min(0).max(10).step(0.1).name('Light Z')

  scene.add(wall_directionalLight)
  objectsStatic.push( wall_directionalLight )

  wall_directionalLight.castShadow = true
  wall_directionalLight.shadow.mapSize.width = 2048
  wall_directionalLight.shadow.mapSize.height = 2048
  wall_directionalLight.shadow.normalBias = 0.1 // round surfaces

  wall_directionalLight.shadow.camera.near = 1
  wall_directionalLight.shadow.camera.far = 17
  wall_directionalLight.shadow.camera.left = -5
  wall_directionalLight.shadow.camera.top = 5
  wall_directionalLight.shadow.camera.right = 8
  wall_directionalLight.shadow.camera.bottom = -2


  const wall_directionalLightHelper = new THREE.CameraHelper(wall_directionalLight.shadow.camera)
  scene.add(wall_directionalLightHelper)
  wall_directionalLightHelper.visible = false
  folder.add(wall_directionalLightHelper, 'visible').name('ShadowCam')

  objectsStatic.push( wall_directionalLightHelper )

  scene.background = new THREE.Color('#CCC3B6');

}

// Animations ————————————————————————————————————————————————————————

const tick = ( elapsedTime ) =>
{
  // Wall
  if( cursor ){
    camera.position.x = Math.sin( cursor.x * Math.PI / 32 ) * 9
    camera.position.z = Math.cos( cursor.x * Math.PI / 32 ) * 9
    camera.position.y = cursor.y * 2 + 3
    camera.lookAt( new THREE.Vector3( 0,2,0 ) )
  }
}

// Remove
const remove = () => {

  console.log('Remove WallScene')

  scene.background = null;

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

