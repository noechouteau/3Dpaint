import * as THREE from 'three';
import gsap from 'gsap';
import frag  from "./shaders/diffuse_f.js";
import vert  from "./shaders/diffuse_v.js";
import frag2 from "./plane/circle_f.js";
import vert2 from "./plane/circle_v.js";
import frag3 from "./circle/diffuse_f.js";
import vert3 from "./circle/diffuse_v.js";
import vertSky from './sky/diffuse_v.js';
import fragSky from './sky/diffuse_f.js';
import vertBand from './banderole/diffuse_v.js';
import fragBand from './banderole/diffuse_f.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// const transitionTexture = (material, targetTexture) => {
//     gsap.timeline({
//         defaults: {
//             overwrite: true
//         }
//     })
//         .set(material.uniforms.uTargetTexture, { value: targetTexture })
//         .to(material.uniforms.uTextureT, { 
//             value: 1,
//             duration: 1,
//             onComplete: () => {
//                 material.uniforms.uCurrentTexture.value = targetTexture;
//                 material.uniforms.uTextureT.value = 0;
//             }
//         })
// }

const scene = new THREE.Scene();
scene.background = new THREE.Color("#32b8b8");
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();



const texture1 = await textureLoader.loadAsync('./emotion.jpg');
const texture2 = await textureLoader.loadAsync('./ror1.jpg');
const texture3 = await textureLoader.loadAsync('./goghall.jpg');
const texture5 = await textureLoader.loadAsync('./wall.jpg');

const fullTex = await textureLoader.loadAsync('./fullTex.png');
fullTex.wrapS = THREE.RepeatWrapping;
fullTex.wrapT = THREE.RepeatWrapping;
const drawWall = await textureLoader.loadAsync('./drawWall.png');

const emoRED = await textureLoader.loadAsync('./emoRED.jpg');
const emoBLACK = await textureLoader.loadAsync('./emoBLACK.jpg');
const emoWHITE = await textureLoader.loadAsync('./emoWHITE.jpg');
const emotions = [emoRED, emoBLACK, emoWHITE];

let groundTexture = await textureLoader.loadAsync('./emoBG.jpg');
let groundTexture2 = await textureLoader.loadAsync('./fullTex.png');
let groundTexture3 = await textureLoader.loadAsync('./goghall.jpg');
let groundTexture4 = await textureLoader.loadAsync('./groundWall.png');
const skyTexture = await textureLoader.loadAsync('./emoBG.jpg');
const skyGogh = await textureLoader.loadAsync('./vanBG.jpg');
skyGogh.wrapS = THREE.RepeatWrapping;
skyGogh.wrapT = THREE.RepeatWrapping;
// defTexture.wrapS = THREE.RepeatWrapping;
// defTexture.wrapT = THREE.RepeatWrapping;
const textures = [texture1, texture2, texture3, texture5];
let banderoles = [];
let previousWord = null;
let redWord = null;
let whiteWord = null;
let yellowWord = null;
let greenWord = null;

gltfLoader.load('./emotions.glb', (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.position.z = -6;
    gltf.scene.position.y = -1.2;
    gltf.scene.scale.set(0.8, 0.8, 0.8);
    previousWord = gltf.scene;
    redWord = gltf.scene;
});

gltfLoader.load('./incon.glb', (gltf) => {
    gltf.scene.position.z = -6;
    gltf.scene.position.y = -1.2;
    gltf.scene.scale.set(0.8, 0.8, 0.8);
    whiteWord = gltf.scene;
});

gltfLoader.load('./beaute.glb', (gltf) => {
    gltf.scene.position.z = -6;
    gltf.scene.position.y = -1.2;
    gltf.scene.scale.set(0.8, 0.8, 0.8);
    yellowWord = gltf.scene;
});

gltfLoader.load('./mess.glb', (gltf) => {
    gltf.scene.position.z = -6;
    gltf.scene.position.y = -1.2;
    gltf.scene.scale.set(0.8, 0.8, 0.8);
    greenWord = gltf.scene;
});


camera.position.z = 1;

let sphereCreated = null;
let sky = null;
let ground = null;

const createSphere = (texture) => {
    const geometry = new THREE.DodecahedronGeometry( 1, 128 );
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uColor: { value: new THREE.Color(0x00ff00) },
            uTexture: { value: texture },
            
        },
        vertexShader: vert, 
        fragmentShader: frag,
        transparent: true,
    });
    const sphere = new THREE.Mesh( geometry, material );
    sphereCreated = sphere;
    sphere.position.z = -5;
    sphere.rotation.y = Math.PI * 0.5;
    sphere.scale.set(0.7, 0.7, 0.7);
    scene.add( sphere );
    return sphere;
}

const createPlane = (position,rotation) => {
    const geometry = new THREE.PlaneGeometry( 7, 0.5, 128 );
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: new THREE.Color(0x00ff00) },
            uTexture: { value: fullTex },
            uTime: { value: 0.0 },
            uOffset: { value: Math.random() * 10.0 },
        },
        vertexShader: vertBand, 
        fragmentShader: fragBand,
        transparent: true,
        side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh( geometry, material );
    plane.position.copy(position);
    plane.rotation.y = rotation.y;
    scene.add( plane );
    banderoles.push(plane);
    return plane;
}

const createCircle = () => {
    const geometry = new THREE.CircleGeometry( 5, 128 );
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: new THREE.Color(0x00ff00) },
            uTexture: { value: groundTexture },
            uCurrentTexture: { value: groundTexture },
            uTargetTexture: { value: groundTexture },
            uTime: { value: 0.0 },
            uTextureT: { value: 0.0 },
            uBiome: { value: 0.0 },
        },
        vertexShader: vert3, 
        fragmentShader: frag3,
    });
    const circle = new THREE.Mesh( geometry, material );
    circle.rotation.x = Math.PI * 1.5;
    circle.position.y = -1;
    circle.position.z = -1;
    ground = circle;
    scene.add( circle );
}

const createMonolith = () => {
    const geometry = new THREE.BoxGeometry(2, 7, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const monolith = new THREE.Mesh( geometry, material );
    monolith.position.z = -6;
    monolith.position.y = 1;
    scene.add( monolith );
}

const createSky = () => {
    // const geometry = new THREE.PlaneGeometry( 720/7, 405/7, 128 );
    const geometry = new THREE.SphereGeometry( 200, 128, 128 );
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: new THREE.Color(0x00ff00) },
            uTexture: { value: skyTexture },
            uTime: { value: 0.0 },
            uWorld: { value: 0.0 },
        },
        vertexShader: vertSky, 
        fragmentShader: fragSky,
        transparent: true,
        side: THREE.DoubleSide,
    });
    material.name = "skyMat";
    const skyMesh = new THREE.Mesh( geometry, material );
    // skyMesh.position.z = -40;
    skyMesh.rotation.y = Math.PI * 0.5;
    skyMesh.rotation.x = Math.PI * 0.6;
    sky = skyMesh;
    scene.add( sky );
}


function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener('resize', resize);


document.addEventListener('click', (event) => {
    console.log(event.cl)
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if(intersects.length > 0) {
        console.log(intersects[0].object);
        if(intersects[0].object.name != undefined) {
            changeWorld(intersects[0].object.name);
        }
    }
})

const changeWorld = (world) => {
    if(banderoles.length > 0 && world != 1) {
        banderoles.forEach(band => {
            scene.remove(band);
        });
        banderoles = [];
    }
    switch(world) {

        case 0:
            console.log("world 0");
            sky.material.uniforms.uWorld.value = 0.0;
            sky.geometry.dispose();
            sky.geometry = new THREE.SphereGeometry( 200, 128, 128 );
            sky.material.uniforms.uTexture.value = skyTexture;
            sky.material.uniforms.uTexture.needsUpdate = true;
            sky.rotation.y = Math.PI * 0.5;
            sky.rotation.x = Math.PI * 0.6;
            sky.position.z = -40;
            sky.position.y = 0;
            ground.rotation.z = 0;
            scene.background = new THREE.Color("#32b8b8");
            ground.material.uniforms.uTexture.value = groundTexture;
            ground.material.uniforms.uTexture.needsUpdate = true;
            ground.material.uniforms.uBiome.value = 0.0;
            if(previousWord != redWord) {
                scene.remove(previousWord);
                scene.add(redWord);
                previousWord = redWord;
            }
            break;
        case 1:
            console.log("world 1");
            if(banderoles.length == 0) {
                createPlane({x: -2, y: -0.5, z: -4}, {x: 0, y: Math.PI*0.32, z: 0});
                createPlane({x: 2, y: -0.5, z: -4}, {x: 0, y: -Math.PI*0.32, z: 0});
                createPlane({x: -2, y: 2, z: -4}, {x: 0, y: Math.PI*0.32, z: 0});
                createPlane({x: 2, y: 2, z: -4}, {x: 0, y: -Math.PI*0.32, z: 0});
            }

            sky.material.uniforms.uWorld.value = 1.0;
            sky.geometry.dispose();
            sky.geometry = new THREE.PlaneGeometry( 720/7, 405/10, 128 );
            sky.rotation.y = 0;
            sky.rotation.x = 0;
            sky.position.z = -40;
            sky.position.y = sky.geometry.parameters.height / 2.5;
            ground.rotation.z = Math.PI * -0.12;
            scene.background = new THREE.Color("#ffffff");
            ground.material.uniforms.uTexture.value = groundTexture2;
            ground.material.uniforms.uTexture.needsUpdate = true;
            ground.material.uniforms.uBiome.value = 1.0;
            console.log(sky)
            if(previousWord != whiteWord) {
                scene.remove(previousWord);
                scene.add(whiteWord);
                previousWord = whiteWord;
            }
            break;
        case 4:
            console.log("world 4");
            sky.material.uniforms.uWorld.value = 2.0;
            sky.geometry.dispose();
            sky.geometry = new THREE.SphereGeometry( 200, 128, 128 );
            sky.rotation.y = Math.PI * 0.5;
            sky.rotation.x = Math.PI * -0.4;
            sky.position.z = -40;
            sky.position.y = 0;
            ground.rotation.z = 0;
            sky.material.uniforms.uTexture.value = skyGogh;
            sky.material.uniforms.uTexture.needsUpdate = true;
            scene.background = new THREE.Color("#32b8b8");
            ground.material.uniforms.uTexture.value = groundTexture3;
            ground.material.uniforms.uTexture.needsUpdate = true;
            ground.material.uniforms.uBiome.value = 2.0;
            if(previousWord != yellowWord) {
                scene.remove(previousWord);
                scene.add(yellowWord);
                previousWord = yellowWord;
            }
            break;
        case 5:
            console.log("world 5");
            sky.material.uniforms.uWorld.value = 3.0;
            sky.geometry.dispose();
            sky.geometry = new THREE.SphereGeometry( 200, 128, 128 );
            sky.rotation.y = Math.PI * 0.5;
            sky.rotation.x = Math.PI * -0.4;
            sky.position.z = -40;
            sky.position.y = 0;
            ground.rotation.z = Math.PI * -0.12;
            sky.material.uniforms.uTexture.value = drawWall;
            sky.material.uniforms.uTexture.needsUpdate = true;
            ground.material.uniforms.uTexture.value = groundTexture4;
            ground.material.uniforms.uTexture.needsUpdate = true;
            ground.material.uniforms.uBiome.value = 3.0;
            if(previousWord != greenWord) {
                scene.remove(previousWord);
                scene.add(greenWord);
                previousWord = greenWord;
            }
            break;
        default:
            console.log("default");
            break;
    }
}

function animate() {
	renderer.render( scene, camera );
    raycaster.setFromCamera( pointer, camera );

    const intersects = raycaster.intersectObjects( scene.children );

    scene.children.forEach(child => {
        if(child.material) {
            if(child.material.uniforms) {
                if (child.material.uniforms.uTime) {
                    child.material.uniforms.uTime.value = performance.now() / 1000;
                }
            }
        }

    });

    console.log(sky.material.uniforms.uWorld.value)
}

function setup() {
    for(let i = 0; i < textures.length; i++) {
        let sphere = createSphere(textures[i]);
        sphere.position.x = i * 2 -5;

        if(i == 0) {
            sphere.rotation.y = Math.PI * 0.8;
            sphere.position.x = -7;
            sphere.name = 0;
        }
        else if (i == 1) {
            sphere.rotation.y = Math.PI * 0.7;
            sphere.position.y = 1.5;
            sphere.rotation.z = Math.PI * 0.05;
            sphere.position.x = -5;
            sphere.name = 1;
        }
        else if (i == 2) {
            sphere.rotation.y = Math.PI * 0.25;
            sphere.rotation.z = Math.PI * 0.05;
            sphere.position.y = 1.5;
            sphere.position.x = 5;
            sphere.name = 4;
        }
        else if (i == 3) {
            sphere.rotation.y = Math.PI * 0.2;
            sphere.position.x = 7;
            sphere.name = 5;
        }
    }
    createMonolith();
    createCircle();
    createSky();


    animate();
}
setup();
renderer.setAnimationLoop( animate );
