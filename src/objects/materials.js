import * as THREE from 'three'


const material_vinylBeige = new THREE.MeshStandardMaterial()
material_vinylBeige.color = new THREE.Color(0xCCC3B6)
material_vinylBeige.side = THREE.DoubleSide

const material_vinylBrown = new THREE.MeshStandardMaterial()
material_vinylBrown.color = new THREE.Color(0xA69171)
material_vinylBrown.side = THREE.DoubleSide

const material_vinylRed = new THREE.MeshStandardMaterial()
material_vinylRed.color = new THREE.Color(0xE46240)
material_vinylRed.side = THREE.DoubleSide


export { material_vinylBeige, material_vinylBrown, material_vinylRed }