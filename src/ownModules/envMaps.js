import * as THREE from 'three'

const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMap = cubeTextureLoader.load([
  '/textures/environmentMap/px.jpg',
  '/textures/environmentMap/nx.jpg',
  '/textures/environmentMap/py.jpg',
  '/textures/environmentMap/ny.jpg',
  '/textures/environmentMap/pz.jpg',
  '/textures/environmentMap/nz.jpg',
])
environmentMap.encoding = THREE.sRGBEncoding

export {
  environmentMap
}
