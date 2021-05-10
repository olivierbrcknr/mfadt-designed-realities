import './css/reset.css'
import './css/variables.css'
import './css/grid.css'
import './css/style.css'

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

import * as dat from 'dat.gui'
import Stats from 'stats.js'

import objectData from './json/objects.json'

import teapotScene from './scenes/teapot.js'
import introScene from './scenes/introScene'
import wallScene from './scenes/wallScene'
import roomScene from './scenes/roomScene'
import museumScene from './scenes/museumScene'
import entranceScene from './scenes/entranceScene'
import objectScene from './scenes/objectsScene'

import { environmentMap } from './ownModules/envMaps'

// html
const canvas = document.querySelector('#threeCanvas')
const header = document.querySelector('#header .title')
const pageTitleDOM = header.querySelector('h1')
const titleDOM = header.querySelector(".objectTitle")
const projectList = document.querySelector('#projectList')
const projectDesc = document.querySelector('#projectInfo')

let isIntro = true
let currentSceneName = 'intro'

const createProjectInfoRow = ( container, info, num, isOnlyInfo = false ) => {

  const listItem = document.createElement("div")
  listItem.classList.add("columnContainer")
  if( isOnlyInfo ){

  }else{
    listItem.classList.add("project")
    listItem.addEventListener("click",()=>{
      switchScene( info.slug )
      window.scrollTo({top: 0, behavior: 'smooth'});
    })
  }
  if( info.active === false ){
    listItem.classList.add("notReadyYet")
  }

  const listItem_Num = document.createElement("div")
  listItem_Num.classList.add("project_num")
  listItem_Num.innerHTML = "Exploration #"+num
  listItem.appendChild(listItem_Num)

  const listItem_title = document.createElement("div")
  listItem_title.classList.add("project_title")
  listItem_title.innerHTML = info.name
  listItem.appendChild(listItem_title)

  const listItem_desc = document.createElement("div")
  listItem_desc.classList.add("project_text")
  listItem_desc.innerHTML = info.desc
  listItem.appendChild(listItem_desc)

  container.appendChild(listItem)

}

let dataIndex = 1
for( const info of objectData ){

  createProjectInfoRow( projectList , info, dataIndex )

  dataIndex++
}

// Debug ————————————————————————————————————————————————————————
const gui = new dat.GUI({
  width: 400
})
const sceneFolder = gui.addFolder('Scenes')
const cameraFolder = gui.addFolder('Camera')
const debugObject = {}

const isDev = (process.env.NODE_ENV === 'development')

if( !isDev ){
  gui.hide()
}

let showStats = true
const stats = new Stats()
stats.showPanel(0) // fps panel
document.body.appendChild( stats.dom )

if(!isDev){
  stats.dom.style.display = 'none'
  showStats = false
}

debugObject.toggleFPS = () => {
  if( showStats ){
    stats.dom.style.display = 'none'
  }else{
    stats.dom.style.display = 'block'
  }
  showStats = !showStats
}
gui.add(debugObject,"toggleFPS")

let infoHeight = 0

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight - infoHeight
}

// Loaders
const textureLoader = new THREE.TextureLoader()

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Environment map
scene.environment = environmentMap

scene.add(camera)

cameraFolder.add( camera.position, 'x', -10, 20, 0.01 ).name('Position X')
cameraFolder.add( camera.position, 'y', -10, 20, 0.01 ).name('Position Y')
cameraFolder.add( camera.position, 'z', -10, 20, 0.01 ).name('Position Z')
cameraFolder.add( camera, 'fov', 10, 100, 0.01 ).name('FoV').onChange(()=>{
  camera.updateProjectionMatrix()
})
cameraFolder.add(camera, 'zoom', 0.01, 10, 0.01).name("Zoom").onChange(()=>{
  camera.updateProjectionMatrix();
})

const axesHelper = new THREE.AxesHelper(3)
axesHelper.visible = isDev
scene.add(axesHelper)
gui.add( axesHelper, 'visible' ).name('AxesHelper')

// RayCaster for cursor interactions
const cursor = new THREE.Vector2()
canvas.addEventListener('mousemove',(e)=>{

    cursor.x = e.clientX / ( sizes.width/2 ) - 1
    cursor.y = - ( e.clientY + window.scrollY ) / ( sizes.height/2 ) + 1

    if( currentScene && currentScene.mouseMove ){
      currentScene.mouseMove( cursor )
    }
})
const raycaster = new THREE.Raycaster()

let currentScene = introScene;


// delete
debugObject.resetScene = () => {

  if( currentScene ){
    console.log('resetting scene')
    currentScene.remove()
    currentScene = null
  }
}
sceneFolder.add(debugObject,"resetScene")

// show Scene
debugObject.showScene = () => {
  console.log(scene)
}
sceneFolder.add(debugObject,"showScene").name('Log Scene object')


// Init Scenes
debugObject.initIntroScene = () => {
  debugObject.resetScene()
  currentScene = introScene;
  currentScene.init(renderer, scene, camera, canvas, gui, sizes, textureLoader, gltfLoader, raycaster, switchScene);
}
sceneFolder.add(debugObject,"initIntroScene").name('Start Intro Scene')

debugObject.initTeaPotScene = () => {
  debugObject.resetScene()
  currentScene = teapotScene;
  currentScene.init(renderer, scene, camera, canvas, gui, sizes, gltfLoader);
}
sceneFolder.add(debugObject,"initTeaPotScene").name('Start Teapot Scene')

debugObject.initWallScene = () => {
  debugObject.resetScene()
  currentScene = wallScene;
  currentScene.init(renderer, scene, camera, canvas, gui, sizes, gltfLoader, textureLoader);
}
sceneFolder.add(debugObject,"initWallScene").name('Start Wall Scene')

debugObject.initRoomScene = () => {
  debugObject.resetScene()
  currentScene = roomScene;
  currentScene.init(renderer, scene, camera, canvas, gui, gltfLoader, textureLoader);
}
sceneFolder.add(debugObject,"initRoomScene").name('Start Room Scene')

debugObject.initMuseumScene = () => {
  debugObject.resetScene()
  currentScene = museumScene;
  currentScene.init(renderer, scene, camera, canvas, gui, gltfLoader, textureLoader);
}
sceneFolder.add(debugObject,"initMuseumScene").name('Start Museum Scene')

debugObject.initEntranceScene = () => {
  debugObject.resetScene()
  currentScene = entranceScene;
  currentScene.init(renderer, scene, camera, canvas, gui, gltfLoader, textureLoader);
}
sceneFolder.add(debugObject,"initEntranceScene").name('Start Entrance Scene')

debugObject.initObjectsScene = () => {
  debugObject.resetScene()
  currentScene = objectScene;
  currentScene.init(renderer, scene, camera, canvas, gui, gltfLoader, textureLoader);
}
sceneFolder.add(debugObject,"initObjectsScene").name('Start Objects Scene')


const switchScene = (name) => {

  let isAvailable = true

  isIntro = false
  switch(name){
    case 'intro':
      debugObject.initIntroScene()
      isIntro = true
      break;
    case 'teapot':
      debugObject.initTeaPotScene()
      break;
    case 'wall':
      debugObject.initWallScene()
      break;
    case 'room':
      debugObject.initRoomScene()
      break;
    case 'museum':
      debugObject.initMuseumScene()
      break;
    case 'entrance':
      debugObject.initEntranceScene()
      break;
    case 'objects':
      debugObject.initObjectsScene()
      break;
    default:
      isAvailable = false
      break;
  }

  if( isAvailable ){
    console.log('%cswitching to '+name,'color: #57E28E;')
  }else{
    console.log('%csorry, '+name+' does not exist yet','color: #E46240;')
  }

  if( currentSceneName !== name && isAvailable ){

    currentSceneName = name
    document.querySelector('#wrapper').classList.remove('isDark')

    if( isIntro ){
      titleDOM.innerHTML = ""
      infoHeight = 0
      document.querySelector('#wrapper').classList.remove('isProject')
    }else{
      const currInfo = objectData.find( i => i.slug === currentSceneName )

      const indexNum = objectData.indexOf(currInfo) + 1

      titleDOM.innerHTML = currInfo["name"]
      infoHeight = 200
      document.querySelector('#wrapper').classList.add('isProject')
      if( currInfo.isDark ){
        document.querySelector('#wrapper').classList.add('isDark')
      }
      projectDesc.innerHTML = ""
      createProjectInfoRow( projectDesc , currInfo, indexNum, true )
    }

    updateRenderSizes()
  }

}


pageTitleDOM.addEventListener('click',()=>{
  if( !isIntro ){
    switchScene('intro')
  }
})

// Init Scene ————————————————————————————————————————————————————————

currentScene.init(renderer, scene, camera, canvas, gui, sizes, textureLoader, gltfLoader, raycaster, switchScene);

// Animations ————————————————————————————————————————————————————————

const clock = new THREE.Clock()

const tick = () =>
{
  stats.begin()

  const elapsedTime = clock.getElapsedTime()

  if( currentScene ){

    currentScene.tick( elapsedTime )
    // renderer.update()
  }


  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)

  stats.end()
}

tick()


const updateRenderSizes = () => {
  // update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight - infoHeight

  // update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // update renderer
  renderer.setSize(sizes.width, sizes.height)
}

// Fix elements
window.addEventListener('resize', () => {

  updateRenderSizes()

})

window.addEventListener('scroll', () => {

})
