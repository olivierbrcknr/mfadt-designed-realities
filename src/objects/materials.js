import * as THREE from 'three'

const textureLoader = new THREE.TextureLoader()

// Textures
const matCap_porcelain = textureLoader.load('/textures/matcaps/porcelain.jpg')
const matCap_porcelain_Beige = textureLoader.load('/textures/matcaps/porcelain_beige.jpg')

// Materials
const material_porcelain = new THREE.MeshMatcapMaterial()
material_porcelain.matcap = matCap_porcelain
material_porcelain.side = THREE.DoubleSide

const material_porcelain_Beige = new THREE.MeshMatcapMaterial()
material_porcelain_Beige.matcap = matCap_porcelain_Beige
material_porcelain_Beige.side = THREE.DoubleSide

// Basic
const material_vinylBeige = new THREE.MeshStandardMaterial()
material_vinylBeige.color = new THREE.Color(0xCCC3B6)
material_vinylBeige.side = THREE.DoubleSide

const material_vinylBrown = new THREE.MeshStandardMaterial()
material_vinylBrown.color = new THREE.Color(0xA69171)
material_vinylBrown.side = THREE.DoubleSide

const material_vinylRed = new THREE.MeshStandardMaterial()
material_vinylRed.color = new THREE.Color(0xE46240)
material_vinylRed.side = THREE.DoubleSide

const material_transparent = new THREE.MeshBasicMaterial()
material_transparent.transparent = true
material_transparent.opacity = 0

const material_glossyRed = new THREE.MeshStandardMaterial()
material_glossyRed.color = new THREE.Color(0xE46240)
material_glossyRed.side = THREE.DoubleSide
material_glossyRed.metalness = 0.4
material_glossyRed.roughness = 0.4

const material_hover = new THREE.MeshStandardMaterial()
material_hover.color = new THREE.Color(0xE46240)
material_hover.transparent = true
material_hover.opacity = 0.4

export { 
    material_vinylBeige, 
    material_vinylBrown, 
    material_vinylRed, 
    material_porcelain,
    material_porcelain_Beige,
    material_transparent,
    material_glossyRed,
    material_hover
}