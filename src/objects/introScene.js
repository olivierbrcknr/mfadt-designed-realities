import * as THREE from 'three'
import CANNON from 'cannon'

import { material_vinylBeige, material_vinylBrown, material_vinylRed } from './materials.js'
import { DirectionalLightHelper } from 'three'

let renderer = null
let object_teapot = null
let controls = null
let scene = null
let gui = null
let folder = null
let raycaster = null
let cursor = null
let camera = null
let canvas = null

let callback = () => {}

const objectScales = {
  teapot: 0.02,
  wall: 20
}

const objectsStatic = [] // mesh (non physics)
const objectsToUpdate = [] // pyhsics
// const objectsToTest = [] // raycaster

// set physics world
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase( world )
world.allowSleep = true
world.gravity.set( 0, - 9.82, 0 )

const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.3 // bouncyness (default: 0.3)
    }
)
world.addContactMaterial( defaultContactMaterial )
world.defaultContactMaterial = defaultContactMaterial

// Helper functions
// box
const boxGeometry = new THREE.BoxGeometry( 1, 1, 1 )

const createBox = ( width, height, depth, position, optName ) => {

    let randomPosition = {
        x: position.x + Math.random()-0.5,
        y: position.y + Math.random()-0.5,
        z: position.z + Math.random()-0.5
    }

    // THREE mesh
    const mesh = new THREE.Mesh(
        boxGeometry,
        material_vinylBrown
    )
    mesh.scale.set( width, height, depth )
    mesh.castShadow = true
    mesh.position.copy( randomPosition )

    if( optName ){
        mesh.name = optName
    }

    scene.add(mesh)

    // CANNON body
    const shape = new CANNON.Box( new CANNON.Vec3( width/2, height/2, depth/2 ) )
    const body = new CANNON.Body({
        mass: 2,
        position: new CANNON.Vec3(0,3,0),
        shape,
        material: defaultMaterial
    })
    body.position.copy( randomPosition )

    let axis = new CANNON.Vec3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5);
    let angle = Math.PI / (Math.random()-0.5)*4;
    body.quaternion.setFromAxisAngle(axis, angle);

    // body.addEventListener('collide',playHitSound)

    world.add( body )

    objectsToUpdate.push({
        body,
        mesh
    })

}

// Init function 
const init = ( actualRenderer, actualScene, actualCamera, actualCanvas, actualGui, sizes, txL, objL, actualRayCaster, hasCallBack=()=>{} ) => {

    renderer = actualRenderer
    gui = actualGui
    canvas = actualCanvas
    folder = gui.addFolder('IntroScene')
    folder.isOpen = true
    scene = actualScene
    raycaster = actualRayCaster
    camera = actualCamera

    callback = hasCallBack

    // Update existing objects
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    camera.position.y = 10;
    camera.position.x = 7;
    camera.position.z = 7;

    folder.add( camera, 'zoom', 0, 10, 0.1).onChange(()=>{
        camera.updateProjectionMatrix()
    })

    // floor - physics
    const floorShape = new CANNON.Plane() // is infinite
    const floorBody = new CANNON.Body()
    floorBody.mass = 0 // object is static
    floorBody.addShape( floorShape ) 
    floorBody.quaternion.setFromAxisAngle(  // only can do quaternion
        new CANNON.Vec3(-1,0,0),
        Math.PI / 2
    )
    world.addBody( floorBody )

    // floor - three
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 50),
        material_vinylBeige
    )
    floor.rotation.x = - Math.PI * 0.5
    floor.rotation.z = - Math.PI * 0.25
    floor.receiveShadow = true
    scene.add(floor)

    objectsStatic.push({
        body: floorBody,
        mesh: floor
    })

    camera.lookAt(floor.position)

    // lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambientLight)

    objectsStatic.push({
        body: null,
        mesh: ambientLight
    })

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(1024, 1024)
    directionalLight.shadow.camera.far = 20
    directionalLight.shadow.camera.left = - 7
    directionalLight.shadow.camera.top = 7
    directionalLight.shadow.camera.right = 7
    directionalLight.shadow.camera.bottom = - 7
    directionalLight.position.set(7, 10, 3)
    scene.add(directionalLight)

    objectsStatic.push({
        body: null,
        mesh: directionalLight
    })

    const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
    scene.add(directionalLightCameraHelper)
    directionalLightCameraHelper.visible = false
    folder.add(directionalLightCameraHelper, 'visible').name('CameraHelper')

    objectsStatic.push({
        body: null,
        mesh: directionalLightCameraHelper
    })

    // Room
    createBox(3,3,3,{x:4,y:5,z:-2},'room')

    // teapot
    createBox(0.5,0.5,0.5,{x:2,y:3,z:4},'teapot')

    // chair
    createBox(1,4,1,{x:-2,y:3,z:-4},'chair')

    // coins
    createBox(2,0.5,2,{x:-4,y:3,z:2},'wall')

    // compass
    createBox(1,1,1,{x:0,y:3,z:0},'compass')


    window.addEventListener('click', checkIfClick)    
}

// Animations ————————————————————————————————————————————————————————
let oldElapsedTime = 0
const fps = 60
let currentIntersect = null

const tick = ( elapsedTime ) =>
{
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    const objectsToTest = []

    // for( const object of objectsToUpdate ){
    //     object.body.applyForce( 
    //         new CANNON.Vec3(-6, 0, 0), 
    //         object.body.position 
    //     )
    // }

    // if( elapsedTime > 3 ){
    //     world.gravity.set( 0, 2, 0 )
    // }

    world.step(1/fps, deltaTime, 3)

    for( const object of objectsToUpdate ){
        object.mesh.position.copy( object.body.position )
        object.mesh.quaternion.copy( object.body.quaternion )
        objectsToTest.push( object.mesh )
    }

    if( cursor && raycaster ){

        raycaster.setFromCamera(cursor, camera)
        const intersects = raycaster.intersectObjects( objectsToTest )
        for ( const object of objectsToTest ){
            // object.material.color.set('#A69171')
            object.material = material_vinylBrown
        }

        for ( const intersect of intersects ){
            // intersect.object.scale.set(1.2,1.2,1.2)
            intersect.object.material = material_vinylRed
        }

        if( intersects.length ){
            if( currentIntersect === null ){
                // console.log('mousenter')
                canvas.classList.add('--isClick')
            }
            currentIntersect = intersects[0]
        }else{
            if( currentIntersect ){
                // console.log('mouseleave')
                canvas.classList.remove('--isClick')
            }
            currentIntersect = null
        }
    }
}

const checkIfClick = () => { 
    if( currentIntersect ){
        callback(currentIntersect.object.name)
    }
}

// Remove
const remove = () => {

    canvas.classList.remove('--isClick')

    console.log('Remove IntoScene')
    window.removeEventListener('click', checkIfClick) 
    currentIntersect = null

    for( const object of objectsStatic ){
        if( object.body ){
            world.removeBody( object.body )
        }
        if( object.mesh ){
            scene.remove( object.mesh )
        }
    }

    for( const object of objectsToUpdate ){
        world.removeBody( object.body )
        scene.remove( object.mesh )
    }

    gui.removeFolder( folder )
}

const onMouseMove = (cursorPos) => {
    cursor = cursorPos
}

const functionObject = {
  init: init,
  tick: tick,
  remove: remove,
  mouseMove: onMouseMove
}

export default functionObject

