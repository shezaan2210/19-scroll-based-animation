import * as THREE from "three";
import GUI from "lil-gui";
import gsap from "gsap";
import Lenis from '@studio-freight/lenis'

const lenis = new Lenis()

lenis.on('scroll', (e) => {
//   console.log(e)
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)


/**
 * Debug
 */
const gui = new GUI();

const parameters = {
  materialColor: "#ffeded",
};

gui.addColor(parameters, "materialColor");
gui.onChange(() => {
  material.color.set(parameters.materialColor);
});


// Scroll
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', ()=>{
    scrollY = window.scrollY

    const newSection = Math.round(scrollY / sizes.height)

    if(newSection != currentSection){
        currentSection = newSection

        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration: 1.5,
                ease: 'power4.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=2'
            }
        )
    }
})

// Cursor
const Cursor = {}
Cursor.x = 0
Cursor.y = 0

window.addEventListener('mousemove', (event)=>{
    Cursor.x = event.clientX / sizes.width - .5
    Cursor.y = event.clientY / sizes.height - .5
})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// textures
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("/textures/gradients/3.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

// Objects

const mesh1 = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1, 1),
 material
);

const mesh2 = new THREE.Mesh(
  new THREE.TorusGeometry(0.8, 0.3, 16, 100),
  material
);

const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.2, 100, 16),
  material
);

const objectsDistance = 4;

mesh1.position.y = -objectsDistance * 0;
mesh2.position.y = -objectsDistance * 1;
mesh3.position.y = -objectsDistance * 2;

mesh1.position.x = 2
mesh2.position.x = -2
mesh3.position.x = 2



scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

const particlesCount = 200
const positions = new Float32Array(particlesCount * 3)

for (let i = 0; i < particlesCount * 3; i++) {
    positions[i * 3 + 0] = (Math.random() - .5) * 10
    positions[i * 3 + 1] = objectsDistance * .5 - Math.random() * objectsDistance * sectionMeshes.length
    positions[i * 3 + 2] = (Math.random() - .5) * 10
    
}

const particlesGeometry = new THREE.BufferGeometry()
 particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

 const particlesMaterial = new THREE.PointsMaterial(
    {
        color: parameters.materialColor,
        size: .02,
        sizeAttenuation: true
    }
 )
 const particles = new THREE.Points(particlesGeometry, particlesMaterial)
 scene.add(particles)

// Lights
const directionLight = new THREE.DirectionalLight("#ffffff", 3);
directionLight.position.set(1, 1, 0);
scene.add(directionLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setClearAlpha(0);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

// Animate camera
  camera.position.y = - scrollY / sizes.height * objectsDistance

  const parallaxX = - Cursor.x * .5
  const parallaxY = Cursor.y * .5
  cameraGroup.position.x +=  (parallaxX - cameraGroup.position.x) * 3 * deltaTime
  cameraGroup.position.y +=  (parallaxY - cameraGroup.position.y) * 3 * deltaTime

// Animate objects
  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.12;
  }

//   Animate particles
 

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
