import './css/reset.css'
import './css/variables.css'
import './css/grid.css'
import './css/style.css'

import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import * as dat from 'dat.gui'

import objectData from './json/objects.json'

import teapotScene from './objects/teapot.js'
import introScene from './objects/introScene'
import wallScene from './objects/wallScene'
import roomScene from './objects/roomScene'

// html 
const canvas = document.querySelector('#threeCanvas')
const header = document.querySelector('#header .title')
const titleDOM = header.querySelector(".objectTitle")
const projectList = document.querySelector('#projectList')
const projectDesc = document.querySelector('#projectInfo')

let isIntro = true
let currentSceneName = 'intro'

const createProjectInfoRow = ( container, info ) => {

  const listItem = document.createElement("div")
  listItem.classList.add("project")
  listItem.classList.add("columnContainer")
  listItem.addEventListener("click",()=>{
    switchScene( info.slug )
    window.scrollTo({top: 0, behavior: 'smooth'});
  })
  if( info.active === false ){
    listItem.classList.add("notReadyYet")
  }

  const listItem_Num = document.createElement("div")
  listItem_Num.classList.add("project_num")
  listItem_Num.innerHTML = "Exploration #"+dataIndex
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

  createProjectInfoRow( projectList , info )
  
  dataIndex++
}

// Variables ————————————————————————————————————————————————————————
const gui = new dat.GUI()
const sceneFolder = gui.addFolder('Scenes')
const debugObject = {}

const isDev = (process.env.NODE_ENV === 'development')
let isOpen = true

let infoHeight = 0

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight - infoHeight
}

// Loaders
const textureLoader = new THREE.TextureLoader()
const objLoader = new OBJLoader()
const gltfLoader = new GLTFLoader()

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

scene.add(camera)

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

console.log( sizes )


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
  currentScene.init(renderer, scene, camera, canvas, gui, sizes, objLoader);
}
sceneFolder.add(debugObject,"initTeaPotScene").name('Start Teapot Scene')

debugObject.initWallScene = () => {
  debugObject.resetScene()
  currentScene = wallScene;
  currentScene.init(renderer, scene, camera, canvas, gui, sizes, objLoader);
}
sceneFolder.add(debugObject,"initWallScene").name('Start Wall Scene')

debugObject.initRoomScene = () => {
  debugObject.resetScene()
  currentScene = roomScene;
  currentScene.init(renderer, scene, camera, canvas, gui, gltfLoader);
}
sceneFolder.add(debugObject,"initRoomScene").name('Start Room Scene')


const switchScene = (name) => {

  console.log('switching to',name)
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
    default:
      isAvailable = false
      console.log('sorry, does not exist yet',name)
      break;
  }

  if( currentSceneName !== name && isAvailable ){

    currentSceneName = name

    if( isIntro ){
      titleDOM.innerHTML = ""
      infoHeight = 0
      document.querySelector('#wrapper').classList.remove('isProject')
    }else{
      titleDOM.innerHTML = "— "+currentSceneName
      infoHeight = 200
      document.querySelector('#wrapper').classList.add('isProject')

      projectDesc.innerHTML = ""
      const currInfo = objectData.find( i => i.slug === currentSceneName )
      createProjectInfoRow( projectDesc , currInfo )

    }

    updateRenderSizes()
  }

}


header.addEventListener('click',()=>{
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
  const elapsedTime = clock.getElapsedTime()

  if( currentScene ){
    
    currentScene.tick( elapsedTime )
    // renderer.update()
  }

  
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
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
