import { GLTFLoader } from "https://esm.sh/three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "https://esm.sh/three/";

export default class Model {
  constructor(
    clock,
    modelURL,
    globeRadius = 100,
    speed = 0.01,
    scale = [0.1, 0.1, 0.1],
    animateName = "",
    dir = 1,
    ligher = false,
    type = "fly",
    staticPos = []
  ) {
    this.clock = clock;
    this.modelURL = modelURL;
    this.globeRadius = globeRadius;
    this.scale = scale;
    this.model = null;
    this.mixer = null;
    this.angle = 0;
    this.orbitRadius = globeRadius + (type == "swim" ? -1.5 : 30);
    this.dir = dir;
    this.ligher = ligher;
    this.animateName = animateName;
    this.speed = speed;
    this.type = type;
    this.currentTarget = null;
    this.staticPos = staticPos;
  }

  load(scene, onLoaded = () => {}) {
    const loader = new GLTFLoader();

    loader.load(
      this.modelURL,
      (gltf) => {
        this.model = gltf.scene;
        this.model.scale.set(...this.scale);
        scene.add(this.model);
        if (this.ligher) {
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              const oldMat = child.material;
              child.material = new THREE.MeshBasicMaterial({
                map: oldMat.map || null,
                color: 0xffffff,
              });
            }
          });
        }
        // Nếu có animation
        if (gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.model);
          // console.log(gltf.animations);
          if (
            this.animateName != "" &&
            gltf.animations.some(
              (ani) => ani.name.toLowerCase() == this.animateName.toLowerCase()
            )
          ) {
            const specificAnim = gltf.animations.find(
              (ani) => ani.name.toLowerCase() == this.animateName.toLowerCase()
            );
            // console.log(specificAnim);
            this.mixer.clipAction(specificAnim)?.play();
          } else {
            gltf.animations.forEach((clip) => {
              this.mixer.clipAction(clip).play();
            });
          }
        }

        onLoaded();
      },
      undefined,
      (error) => console.error("Error loading model:", error)
    );
  }

  update(delta) {
    if (!this.model) return;
    let x, y, z;
    if (this.staticPos.length == 0) {
      x = this.orbitRadius * Math.cos(this.angle);
      y = 20 * Math.sin(this.angle * 2);
      z = this.orbitRadius * Math.sin(this.angle);
      this.angle += this.speed;
      this.model.rotation.y = -this.angle + Math.PI / this.dir;
      if (this.type == "swim") {
        this.model.rotation.z = 29.9;
      }
    } else {
      x = this.staticPos[0];
      y = this.staticPos[1];
      z = this.staticPos[2];
    }

    this.model.position.set(x, y, z);

    if (this.mixer) {
      this.mixer.update(delta);
    }
  }

  get object3D() {
    return this.model;
  }
}

// // Vệ tinh đơn giản
// const satellite = new THREE.Mesh(
//   new THREE.SphereGeometry(2, 32, 32),
//   new THREE.MeshStandardMaterial({ color: 0xffcc00 })
// );
// scene.add(satellite);

// // Animation loop
// let angle = 0;
// const orbitRadius = globeRadius + 30;

// function animate() {
//   requestAnimationFrame(animate);
//   angle += 0.01;

//   // Cập nhật vị trí vệ tinh
//   satellite.position.x = orbitRadius * Math.cos(angle);
//   satellite.position.z = orbitRadius * Math.sin(angle);
//   satellite.position.y = 20 * Math.sin(angle * 2);
// }

// animate(); // Bắt đầu animation
