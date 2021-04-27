import * as THREE from 'three'
import CANNON from 'cannon'

import { material_vinylBeige, material_vinylBrown, material_vinylRed, material_porcelain_Beige, material_transparent, material_glossyRed, material_hover } from './materials.js'
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

let gravitySelector = null

let callback = () => {}

const objectsStatic = [] // mesh (non physics)
const objectsToUpdate = [] // pyhsics
// const objectsToTest = [] // raycaster

// set physics world
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase( world )
// world.allowSleep = true
world.gravity.set( 0, -9.82, 0 )

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

const createBox = ( width, height, depth, position, mass, optName, hasObj = null, mat = null, totalMultiplier) => {

    let randomPosition = {
        x: position.x + ( Math.random()-0.5 ) * 2,
        y: position.y + ( Math.random()-0.5 ) * 2,
        z: position.z + ( Math.random()-0.5 ) * 2
    }

    let multiplier = hasObj ? 1.1 : 1 
    multiplier = totalMultiplier ? (multiplier * totalMultiplier) : multiplier

    let objectMesh = null

    if( hasObj ){

        objectMesh = hasObj
    
        hasObj.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                if( mat !== false ){
                    if( mat ){
                        child.material = mat
                    }else{
                        child.material = material_vinylBrown
                    }
                }

                child.castShadow = true
            }
        });

        objectMesh.scale.set( totalMultiplier, totalMultiplier, totalMultiplier )
        objectMesh.position.copy( randomPosition )

        scene.add(objectMesh)
    }

    // THREE mesh
    const mesh = new THREE.Mesh(
        boxGeometry,
        ( !hasObj && !mat ) ? material_vinylBrown : material_transparent
    )
    mesh.scale.set( width * multiplier, height * multiplier, depth * multiplier )
    mesh.castShadow = objectMesh ? false : true
    mesh.position.copy( randomPosition )

    if( optName ){
        mesh.name = optName
    }
    scene.add(mesh)

    // CANNON body
    const shape = new CANNON.Box( new CANNON.Vec3( (width*multiplier)/2, (height*multiplier)/2, (depth*multiplier)/2 ) )
    const body = new CANNON.Body({
        mass: mass,
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
        mesh,
        objectMesh
    })

}

const sphereGeometry = new THREE.SphereGeometry( 1, 20, 20 )

const createSphere = (radius, position, optName, hasObj = null, mat = null, totalMultiplier = 1, isCompass = false) => {

    let randomPosition = {
        x: position.x + ( Math.random()-0.5 ) * 2,
        y: position.y + ( Math.random()-0.5 ) * 2,
        z: position.z + ( Math.random()-0.5 ) * 2
    }

    let multiplier = hasObj ? 1.1 : 1 
    multiplier = totalMultiplier ? (multiplier * totalMultiplier) : multiplier

    let objectMesh = null

    let additionalObject = {}

    if( hasObj ){

        objectMesh = hasObj
    
        hasObj.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                if( mat !== false ){
                    if( mat ){
                        child.material = mat
                    }else{
                        child.material = material_vinylBrown
                    }
                }

                child.castShadow = true
            }
            if( isCompass ){
                if( child.name === 'RING' ){
                    
                }
                if( child.name === 'NEEDLE' ){
                    console.log(child)
                    additionalObject.needle = child
                }
            }
        });

        objectMesh.scale.set( totalMultiplier, totalMultiplier, totalMultiplier )
        objectMesh.position.copy( randomPosition )

        scene.add(objectMesh)
    }

    // THREE mesh
    const mesh = new THREE.Mesh(
        sphereGeometry,
        ( !hasObj && !mat ) ? material_vinylBrown : material_transparent
    )
    mesh.scale.set( radius*multiplier, radius*multiplier, radius*multiplier )
    mesh.castShadow = true
    mesh.position.copy( randomPosition )
    scene.add(mesh)

    // CANNON body
    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0,3,0),
        shape,
        material: defaultMaterial
    })
    body.position.copy( randomPosition )

    world.add( body )

    objectsToUpdate.push({
        body,
        mesh,
        objectMesh,
        ...additionalObject
    })
}

const createWall = ( position, q1, q2, q3, rad1, visible = false ) => {

    // floor - physics
    const shape = new CANNON.Plane() // is infinite
    const body = new CANNON.Body()
    body.mass = 0 // object is static
    body.addShape( shape ) 
    body.quaternion.setFromAxisAngle(  // only can do quaternion
        new CANNON.Vec3(q1,q2,q3),
        rad1
    )
    world.addBody( body )
    body.position.copy( position )

    scene.background = new THREE.Color('#CCC3B6');

    // floor - three
    if( visible ){
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(15, 15),
            material_vinylBeige
            // new THREE.MeshStandardMaterial({
            //     transparent: true,
            //     opacity: 0.2,
            //     color: '#fff'
            // })
        )
        mesh.rotation.x = q1 * rad1
        mesh.rotation.y = q2 * rad1
        mesh.rotation.z = q3 * rad1

        mesh.receiveShadow = true
        mesh.position.copy( position )
        scene.add(mesh)

        objectsStatic.push({
            body: body,
            mesh: mesh
        })
    }else{
        objectsStatic.push({
            body: body,
            mesh: null
        })
    }


}

// Init function 
const init = ( actualRenderer, actualScene, actualCamera, actualCanvas, actualGui, sizes, txL, gltfL, actualRayCaster, hasCallBack=()=>{} ) => {

    renderer = actualRenderer
    gui = actualGui
    canvas = actualCanvas
    folder = gui.addFolder('IntroScene')
    folder.isOpen = true
    scene = actualScene
    raycaster = actualRayCaster
    camera = actualCamera
    callback = hasCallBack

    gravitySelector = document.querySelector('#gravitySelector')
    gravitySelector.addEventListener('click',gravClick)
    gravitySelector.classList.remove('isHidden')

    // Update existing objects
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    camera.position.y = 6
    camera.position.x = 5
    camera.position.z = 5

    world.gravity.set( 0, -9.82, 0 )

    folder.add( camera, 'zoom', 0, 10, 0.1).onChange(()=>{
        camera.updateProjectionMatrix()
    })
    folder.add( camera.position, 'z', 0, 30, 0.01).onChange()

    createWall( {x:0,y:0,z:-6}, 0, 0, 1, Math.PI * 0.5 , true) // z neg
    // createWall( {x:0,y:0,z: 8}, 0, 0, -1, -Math.PI * 0.5 , false) // z pos
    createWall( {x:-6,y:0,z:0}, 0, 1, 0, Math.PI/ 2 , true) // x neg
    // createWall( {x:5,y:0,z:0}, 0, -1, 0, Math.PI/ 2 , false) // x pos
    createWall( {x:0,y:0,z:0}, -1, 0, 0, Math.PI/ 2 , true) // y neg (floor)
    createWall( {x:0,y:5,z:0}, 1, 0, 0, Math.PI/ 2 , false) // y pos

    createWall( {x:3,y:0,z:3}, 0, -1, 0, Math.PI* 3/4 , false) // FRONT
    
    camera.lookAt(new THREE.Vector3(0,0,0))

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

    // Room / plant
    // createBox(3,3,3,{x:4,y:5,z:-2},'room')
    gltfL.load(
        '/objects/plant.gltf',
        (gltf) =>
        {
            createBox(
                0.2,0.2,0.2,
                {x:2,y:3,z:0},
                1.7,
                'room', 
                gltf.scene, 
                false, 
                3
            )
        }
    )

    // teapot
    gltfL.load(
        '/objects/teapot_low.gltf',
        (gltf) =>
        {
            createBox(
                1,1,1,
                {x:1,y:3,z:2},
                1.4,
                'teapot', 
                gltf.scene, 
                material_porcelain_Beige, 
                0.5
            )
        }
    )
    
    // chair
    gltfL.load(
        '/objects/chair.gltf',
        (gltf) =>
        {
            createBox(
                0.43,2.73,0.48,
                {x:-2,y:3,z:-4},
                2,
                'chair', 
                gltf.scene, 
                false,
                1.5)
        }
    )
    // createBox(1,4,1,{x:-2,y:3,z:-4},'chair')

    // coins
    // createBox(2,0.5,2,{x:-4,y:3,z:2},'wall')
    gltfL.load(
        '/objects/coins.gltf',
        (gltf) =>
        {
            createBox(
                0.98,0.36,0.62,
                {x:-2,y:3,z:-4},
                0.7,
                'wall', 
                gltf.scene, 
                material_vinylRed,
                1.5)
        }
    )

    // compass
    // createBox(1,1,1,{x:0,y:3,z:0},'compass')
    gltfL.load(
        '/objects/compass.gltf',
        (gltf) =>
        {
            createSphere(
                0.8,
                {x:0,y:3,z:0},
                'compass', 
                gltf.scene, 
                false,
                1,
                true)
        }
    )

    // blurb
    gltfL.load(
        '/objects/blurb.gltf',
        (gltf) =>
        {
            createBox(
                2.6,1.4,2.55,
                {x:-2,y:4,z:2},
                1,
                'museum', 
                gltf.scene, 
                material_vinylRed, 
                0.5
            )
        }
    )


    canvas.addEventListener('click', checkIfClick)    
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

        if( object.objectMesh ){
            object.objectMesh.position.copy( object.body.position )
            object.objectMesh.quaternion.copy( object.body.quaternion )

            // if( object.needle ){
            //     console.log( object.body.quaternion )
            //     object.objectMesh.quaternion.w = - object.body.quaternion.w
            //     object.objectMesh.quaternion.x = 0
            //     object.objectMesh.quaternion.y = 0
            //     object.objectMesh.quaternion.z = 0
            // }
        }

        objectsToTest.push( object.mesh )
    }

    if( cursor && raycaster ){

        raycaster.setFromCamera(cursor, camera)
        const intersects = raycaster.intersectObjects( objectsToTest )
        for ( const object of objectsToUpdate ){
            // object.material.color.set('#A69171')
            if( object.objectMesh ){
                object.mesh.material = material_transparent
            }else{
                object.mesh.material = material_vinylBrown
            }
        }

        for ( const intersect of intersects ){
            // intersect.object.scale.set(1.2,1.2,1.2)
            intersect.object.material = material_hover
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
    }else{
        for( const object of objectsToUpdate ){
            object.body.applyImpulse( new CANNON.Vec3(0, 7, 0), object.body.position )
        }
    }
}

const gravClick = (e) => {
    if( e.target.classList.contains('up') ){
        world.gravity.set( 0, 9.82, 0 )
    }
    if( e.target.classList.contains('down') ){
        world.gravity.set( 0, -9.82, 0 )
    }
    if( e.target.classList.contains('right') ){
        world.gravity.set( 0, 0, -9.82 )
    }
    if( e.target.classList.contains('left') ){
        world.gravity.set( -9.82, 0, 0 )
    }
    if( e.target.classList.contains('front') ){
        world.gravity.set( 5, 0, 5 )
    }

}

// Remove
const remove = () => {

    canvas.classList.remove('--isClick')

    console.log('Remove IntoScene')
    canvas.removeEventListener('click', checkIfClick) 
    gravitySelector.removeEventListener('click',gravClick)
    gravitySelector.classList.add('isHidden')
    
    currentIntersect = null

    scene.background = null

    for( const object of objectsStatic ){
        if( object.body ){
            world.removeBody( object.body )
        }
        if( object.mesh ){
            scene.remove( object.mesh )
        }
        if( object.objectMesh ){
            scene.remove( object.objectMesh )
        }
    }

    for( const object of objectsToUpdate ){
        world.removeBody( object.body )
        scene.remove( object.mesh )
        if( object.objectMesh ){
            scene.remove( object.objectMesh )
        }
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

