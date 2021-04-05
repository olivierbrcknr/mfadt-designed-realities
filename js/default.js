
let windowTop = 0;

let startScene = () => {

  let canWidth = window.innerWidth/2;
  let canHeight = 600;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 50, canWidth / canHeight, 0.1, 1000 );


  scene.background = new THREE.Color( 0xE46240 );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( canWidth, canHeight );
  renderer.antialias = true;

  document.querySelector('.object-Teapot').appendChild( renderer.domElement );

  const mtlLoader = new THREE.MTLLoader();

  const material = new THREE.MeshStandardMaterial( { color: 0xffffff } );

  let obj = null;

  // mtlLoader.load( 'objects/TeaPot.obj', function( materials ) {

    // materials.preload();

    // console.log(materials)

    const loader = new THREE.OBJLoader();

    // loader.setMaterials( materials );

    loader.load(
      // resource URL
      'objects/TeaPot.obj',
      // called when resource is loaded
      function ( object ) {

        obj = object;

        object.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {

                // console.log(child)

                child.material = material;
                child.castShadow = true;
                child.receiveShadow = true;

            }

        } );

        scene.add( object );
        console.log('object added');
      },
      // called when loading is in progresses
      function ( xhr ) {

        console.log( parseInt( xhr.loaded / xhr.total * 100 ) + '% loaded' );

      },
      // called when loading has errors
      function ( error ) {

        console.log( 'An error happened' );

      }
    );
  // });

  const light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
  light.position.set( 10, 5, 20 ); //default; light shining from top
  light.castShadow = true; // default false
  scene.add( light );

  camera.position.y = 10;
  camera.position.z = 60;
  // camera.zoom = 0.00000001;

  let teaScale = 0.02;

  function animate() {
    requestAnimationFrame( animate );

    if( obj ){
      obj.rotation.y += 0.01;
      obj.scale.set( teaScale,teaScale,teaScale );
    }

    renderer.render( scene, camera );
  }
  animate();

  renderer.render( scene, camera );
}


document.addEventListener("DOMContentLoaded", () => {
  startScene();
});

window.addEventListener("scroll", (e) => {
  windowTop = window.pageYOffset;
});






