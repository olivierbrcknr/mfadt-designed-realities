import * as THREE from 'three'
import CANNON from 'cannon'

import { material_vinylBeige, material_vinylBrown, material_vinylRed, material_porcelain_Beige, material_transparent, material_glossyRed, material_hover, material_metall } from './../ownModules/materials'

let renderer = null
let scene = null
let gui = null
let folder = null
let raycaster = null
let cursor = null
let camera = null
let canvas = null

let cameraIsUpsideDown = false
let gravityIsZero = true

let gravitySelector = null

const centerPoint = new THREE.Vector3(0,0,0)

let callback = () => {}

const objectsStatic = [] // mesh (non physics)
let objectsToUpdate = [] // pyhsics
// const objectsToTest = [] // raycaster

// set physics world
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase( world )
world.gravity.set( 0, 0, 0 )

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

const createBox = ( width, height, depth, position, mass, optName, hasObj = null, mat = null, totalMultiplier = 1, dir = '-y' ) => {

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

        if( hasObj.children.length > 0 ){

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
        }else{
          if( mat !== false ){
            if( mat ){
              hasObj.material = mat
            }else{
              hasObj.material = material_vinylBrown
            }
          }
          hasObj.castShadow = true
        }

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

    let objGravity = null
    let gravForce = 3

    switch( dir ){
      case '-x':
        objGravity = new CANNON.Vec3( -gravForce, 0, 0 )
        break
      case '+x':
        objGravity = new CANNON.Vec3( gravForce, 0, 0 )
        break
      case '-y':
      default:
        objGravity = new CANNON.Vec3( 0, -gravForce, 0 )
        break
      case '+y':
        objGravity = new CANNON.Vec3( 0, gravForce, 0 )
        break
      case '+z':
        objGravity = new CANNON.Vec3( 0, 0, gravForce )
        break
      case '-z':
        objGravity = new CANNON.Vec3( 0, 0, -gravForce )
        break
    }

    objectsToUpdate.push({
        body,
        mesh,
        objectMesh,
        // gravity: objGravity
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
            // if( isCompass ){
            //     if( child.name === 'RING' ){

            //     }
            //     if( child.name === 'NEEDLE' ){
            //         console.log(child)
            //         additionalObject.needle = child
            //     }
            // }
        });

        objectMesh.scale.set( totalMultiplier, totalMultiplier, totalMultiplier )
        objectMesh.position.copy( randomPosition )

        objectMesh.renderOrder = -1

        scene.add(objectMesh)
    }

    // THREE mesh
    const mesh = new THREE.Mesh(
        sphereGeometry,
        ( !hasObj && !mat ) ? material_vinylBrown : material_transparent
    )

    if( optName ){
        mesh.name = optName
    }

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
    folder.open()
    scene = actualScene
    raycaster = actualRayCaster
    camera = actualCamera
    callback = hasCallBack

    gravitySelector = document.querySelector('#gravitySelector')
    gravitySelector.addEventListener('click',gravClick)
    gravitySelector.classList.remove('isHidden')

    // const currentSel = gravitySelector.querySelector('.isActive')
    // if( currentSel ){
    //     currentSel.classList.remove('isActive')
    // }
    // gravitySelector.querySelector('.down').classList.add('isActive')

    // Update existing objects
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap


    camera.position.y = 6
    camera.position.x = 5
    camera.position.z = 5

    camera.lookAt(new THREE.Vector3(0,0,0))

    // camera.rotation.z = Math.PI


    world.gravity.set( 0, -9.81, 0 )
    gravityIsZero = false

    createWall( {x:0,y:0,z:-6}, 0, 0, 1, Math.PI * 0.5 , true) // z neg
    // createWall( {x:0,y:0,z: 8}, 0, 0, -1, -Math.PI * 0.5 , false) // z pos
    createWall( {x:-6,y:0,z:0}, 0, 1, 0, Math.PI/ 2 , true) // x neg
    // createWall( {x:5,y:0,z:0}, 0, -1, 0, Math.PI/ 2 , false) // x pos
    createWall( {x:0,y:0,z:0}, -1, 0, 0, Math.PI/ 2 , true) // y neg (floor)
    createWall( {x:0,y:4,z:0}, 1, 0, 0, Math.PI/ 2 , false) // y pos ( ceiling )

    createWall( {x:3,y:0,z:3}, 0, -1, 0, Math.PI* 3/4 , false) // FRONT

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
    folder.add(directionalLightCameraHelper, 'visible').name('Light Helper')


    folder.add(camera.rotation, 'x',0,Math.PI*2,0.01)
    folder.add(camera.rotation, 'y',0,Math.PI*2,0.01)
    folder.add(camera.rotation, 'z',0,Math.PI*2,0.01)

    objectsStatic.push({
      body: null,
      mesh: directionalLightCameraHelper
    })

    // Room / plant
    gltfL.load(
      '/objects/plant.glb',
      (gltf) =>
      {
        createBox(
          0.2,0.2,0.2,
          {x:2,y:3,z:0},
          1.7,
          'room',
          gltf.scene,
          false,
          3,
          '+z'
        )
      }
    )

    // teapot
    gltfL.load(
        '/objects/teapot.glb',
        (gltf) =>
        {

          const obj = gltf.scene.children.find( o => o.name === "TeaPot" )

          createBox(
              2,2,2,
              {x:1,y:3,z:2},
              1.4,
              'teapot',
              obj,
              material_porcelain_Beige,
              0.3,
              '+y'
          )
        }
    )

    // chair
    gltfL.load(
        '/objects/chair.glb',
        (gltf) =>
        {
            createBox(
                0.43,2.73,0.48,
                {x:-2,y:3,z:-4},
                2,
                'chair',
                gltf.scene,
                false,
                1.5,
                '-x'
              )
        }
    )
    // createBox(1,4,1,{x:-2,y:3,z:-4},'chair')

    // coins
    // createBox(2,0.5,2,{x:-4,y:3,z:2},'wall')
    gltfL.load(
        '/objects/coins.glb',
        (gltf) =>
        {
            createBox(
                0.98,0.36,0.62,
                {x:-2,y:3,z:-4},
                0.7,
                'wall',
                gltf.scene,
                material_vinylRed,
                1.5,
                '-z'
              )
        }
    )

    // caliper
    gltfL.load(
      '/objects/caliper.glb',
      (gltf) =>
      {
        createBox(
          1,0.2,0.1,
          {x:2,y:2,z:1},
          1.2,
          'objects',
          gltf.scene,
          material_metall,
          1.5,
          '-y'
        )
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
                'entrance',
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
                material_glossyRed,
                0.5,
                '+x'
            )
        }
    )


    canvas.addEventListener('click', checkIfClick)

    generateImpulse()
    setTimeout( ()=>{
      const currentSel = gravitySelector.querySelector('.isActive')
      if( currentSel ){
          currentSel.classList.remove('isActive')
      }
      world.gravity.set( 0, 0, 0 )
      gravityIsZero = true
      generateImpulse()
    }, 2000 )
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

    for( const object of objectsToUpdate ){
      if( object.gravity ){
        object.body.applyForce( object.gravity , object.body.position )
      }
    }

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

const generateImpulse = ( toVector ) => {

  let targetVector = null

  for( const object of objectsToUpdate ){

    if( toVector ){
      targetVector = new THREE.Vector3()
      targetVector.subVectors( toVector , object.body.position)
    }else{

      if( gravityIsZero ){
        const impX = (Math.random()-0.5) * 5
        const impY = (Math.random()-0.5) * 5
        const impZ = (Math.random()-0.5) * 5
        targetVector = new CANNON.Vec3(impX, impY, impZ)
      }else{
        const newX = world.gravity.x * -1
        const newY = world.gravity.y * -1
        const newZ = world.gravity.z * -1
        targetVector = new CANNON.Vec3(newX, newY, newZ)
      }
    }

    object.body.applyImpulse( targetVector, object.body.position )
  }
}

const checkIfClick = () => {
  if( currentIntersect ){
    callback(currentIntersect.object.name)
  }else{
    generateImpulse( )
  }
}

const gravClick = (e) => {

  let hasNewGravDir = false
  const currentEl = gravitySelector.querySelector('.isActive')
  const toggle = gravitySelector.querySelector('.toggle')

  // is same as before
  if( e.target.classList.contains('isActive') ){
    world.gravity.set( 0, 0, 0 )
    hasNewGravDir = true
  }else{
    if( e.target.classList.contains('up') ){
      world.gravity.set( 0, 9.82, 0 )
      e.target.classList.add( 'isActive' )
      hasNewGravDir = true
    }
    if( e.target.classList.contains('down') ){
      world.gravity.set( 0, -9.82, 0 )
      e.target.classList.add( 'isActive' )
      hasNewGravDir = true
    }
    if( e.target.classList.contains('right') ){
      world.gravity.set( 0, 0, -9.82 )
      e.target.classList.add( 'isActive' )
      hasNewGravDir = true
    }
    if( e.target.classList.contains('left') ){
      world.gravity.set( -9.82, 0, 0 )
      e.target.classList.add( 'isActive' )
      hasNewGravDir = true
    }
    if( e.target.classList.contains('front') ){
      world.gravity.set( 5, 0, 5 )
      e.target.classList.add( 'isActive' )
      hasNewGravDir = true
    }
  }

  if( currentEl && hasNewGravDir ){
    currentEl.classList.remove( 'isActive' )
  }

  if( world.gravity.x === 0 && world.gravity.y === 0 && world.gravity.z === 0 ){
    toggle.innerHTML = 'off'
    gravityIsZero = true
  }else{
    toggle.innerHTML = 'on'
    gravityIsZero = false
  }

  if( e.target.classList.contains('center') ){
    generateImpulse( centerPoint )
  }

  if( e.target.classList.contains('upsidedown') ){

    if( cameraIsUpsideDown ){

      camera.lookAt(new THREE.Vector3(0,0,0))

    }else{

      camera.rotation.z = 3.7

    }
    cameraIsUpsideDown = !cameraIsUpsideDown
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
    cameraIsUpsideDown = false
    camera.rotation.z = 0

    scene.background = null

    for( const object of objectsStatic ){
        if( object.body ){
            world.removeBody( object.body )
        }
        if( object.mesh ){
            scene.remove( object.mesh )
            // object.mesh.geometry.dispose()
            // object.mesh.material.dispose()
        }
        if( object.objectMesh ){
            scene.remove( object.objectMesh )
            // object.objectMesh.geometry.dispose()
            // object.objectMesh.material.dispose()
        }
    }

    for( const object of objectsToUpdate ){
        world.removeBody( object.body )
        scene.remove( object.mesh )
        object.mesh.geometry.dispose()
        // object.mesh.material.dispose()
        if( object.objectMesh ){
            scene.remove( object.objectMesh )
            // object.objectMesh.geometry.dispose()
            // object.objectMesh.material.dispose()
        }
    }

    objectsToUpdate = []

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
