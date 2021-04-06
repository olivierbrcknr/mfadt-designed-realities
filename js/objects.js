
const objLoader = new THREE.OBJLoader();
const mtlLoader = new THREE.MTLLoader();

class ThreeScene {

  constructor(){

    this.scene = new THREE.Scene();

  }

  animate(){


  }
}

let introScene = () => {

  let container = document.querySelector('.object-Intro');
  let objectPath = 'TeaPot.obj';

  let canWidth = container.offsetWidth;
  let canHeight = container.offsetHeight;

  // create Scene
  const scene = new THREE.Scene();

  // add camera
  const camera = new THREE.PerspectiveCamera( 50, canWidth / canHeight, 0.1, 1000 );

  camera.position.y = 0;
  camera.position.z = 3;

  // create renderer
  const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
  renderer.setSize( canWidth, canHeight );
  renderer.setPixelRatio( window.devicePixelRatio );

  // add renderer to DOM
  container.appendChild( renderer.domElement );

  // store to manipulate later
  let obj = null;
  const geometry = new THREE.BoxGeometry( 1, 1, 1 );

  obj = new THREE.Mesh( geometry, basicMaterial );
  scene.add( obj );

  const light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
  light.position.set( 10, 5, 20 );
  light.castShadow = true;
  scene.add( light );

  const light2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
  light2.position.set( -10, -5, 20 );
  light2.castShadow = true;
  scene.add( light2 );

  // actually render the object
  function animate() {
    requestAnimationFrame( animate );
    if( obj ){
      obj.rotation.y += 0.004;
      obj.rotation.z += 0.006;
    }
    renderer.render( scene, camera );
  }
  animate();

}

let teaPotScene = () => {

  let container = document.querySelector('.object-Teapot');
  let objectPath = 'TeaPot.obj';
  let objScale = 0.02;

  let canWidth = container.offsetWidth;
  let canHeight = container.offsetHeight;

  // create Scene
  const scene = new THREE.Scene();

  // add camera
  const camera = new THREE.PerspectiveCamera( 50, canWidth / canHeight, 0.1, 1000 );

  camera.position.y = 00;
  camera.position.z = 60;

  // create renderer
  const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
  renderer.setSize( canWidth, canHeight );
  renderer.setPixelRatio( window.devicePixelRatio );

  // add renderer to DOM
  container.appendChild( renderer.domElement );

  // add controls
  // const controls = new THREE.OrbitControls( camera, renderer.domElement );
  // controls.enableZoom = false;
  // controls.enablePan = false;

  // create material
  const material = new THREE.MeshPhongMaterial( { color: 0xffffff } );


  // store to manipulate later
  let obj = null;

  objLoader.load(
    "objects/"+objectPath,
    // called when resource is loaded
    function ( object ) {

      obj = object;
      object.scale.set( objScale,objScale,objScale );

      object.traverse( function ( child ) {

        // add materials
        if ( child instanceof THREE.Mesh ) {
          child.material = ceramicMaterial;
          child.castShadow = true;
          child.receiveShadow = true;
        }

      });

      scene.add( object );
      console.log('object added',objectPath);
    },
    // called when loading is in progresses
    function ( xhr ) {
      console.log( parseInt( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
      console.error( 'An error happened' );
    }
  );


  const light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
  light.position.set( 10, 5, 20 );
  light.castShadow = true;
  scene.add( light );

  // let pointLight = new THREE.PointLight( 0xffffff, 2 );
  // pointLight.position.set( 10, 5, 20 );
  // scene.add( pointLight );

  // const ambient = new THREE.AmbientLight( 0xffffff );
  // scene.add( ambient );

  // actually render the object
  function animate() {
    requestAnimationFrame( animate );
    if( obj ){
      obj.rotation.y += 0.004;
    }
    // controls.update();
    renderer.render( scene, camera );
  }
  animate();
}
