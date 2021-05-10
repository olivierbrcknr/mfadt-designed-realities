import * as THREE from 'three'

import { environmentMap } from './envMaps'

const textureLoader = new THREE.TextureLoader()

// Textures
const matCap_porcelain = textureLoader.load('/textures/matcaps/porcelain.jpg')
const matCap_porcelain_Beige = textureLoader.load('/textures/matcaps/porcelain_beige.jpg')
const matCap_glossyVinyl = textureLoader.load('/textures/matcaps/blob.jpg')
matCap_glossyVinyl.encoding = THREE.sRGBEncoding


// Materials
const material_porcelain = new THREE.MeshMatcapMaterial()
material_porcelain.matcap = matCap_porcelain
material_porcelain.side = THREE.DoubleSide

const material_porcelain_Beige = new THREE.MeshMatcapMaterial()
material_porcelain_Beige.matcap = matCap_porcelain_Beige
material_porcelain_Beige.side = THREE.DoubleSide

const material_glossyVinyl = new THREE.MeshMatcapMaterial()
material_glossyVinyl.matcap = matCap_glossyVinyl

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
material_glossyRed.metalness = 0.2
material_glossyRed.roughness = 0.3

const material_hover = new THREE.MeshStandardMaterial()
material_hover.color = new THREE.Color(0xE46240)
material_hover.transparent = true
material_hover.opacity = 0.4

// Reflection
const material_glass = new THREE.MeshBasicMaterial({
  envMap: environmentMap,
  reflectivity: 0.8,
  opacity: 0.6,
  transparent: true
})

// Reflection + Light
const material_metall = new THREE.MeshStandardMaterial({
  envMap: environmentMap,
  roughness: 0.1,
  metalness: 0.6,
})

const material_glass_wLight = new THREE.MeshStandardMaterial({
  envMap: environmentMap,
  roughness: 0.1,
  opacity: 0.3,
  transparent: true,
  metalness: 1,
  refractionRatio: 0.8,
})

export {
    material_vinylBeige,
    material_vinylBrown,
    material_vinylRed,
    material_porcelain,
    material_porcelain_Beige,
    material_transparent,
    material_glossyRed,
    material_hover,
    material_glossyVinyl,
    material_metall,
    material_glass,
    material_glass_wLight
}
