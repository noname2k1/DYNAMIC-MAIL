import { GLTFLoader } from "https://esm.sh/three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "https://esm.sh/three/";

export default class Model {
  constructor(
    clock,
    modelURL,
    globeRadius = 100,
    scale = [0.1, 0.1, 0.1],
    animateName = "",
    dir = 1,
    ligher = false
  ) {
    this.clock = clock;
    this.modelURL = modelURL;
    this.globeRadius = globeRadius;
    this.scale = scale;
    this.model = null;
    this.mixer = null;
    this.angle = 0;
    this.orbitRadius = globeRadius + 30;
    this.dir = dir;
    this.ligher = ligher;
    this.animateName = animateName;
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
          // const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
          // hemiLight.position.set(0, 20, 0);
          // this.model.add(hemiLight);

          // const dirLight = new THREE.DirectionalLight(0xffffff, 2);

          // const ambientLight = new THREE.AmbientLight(0xffffff, 10);
          // this.model.add(ambientLight);

          // dirLight.position.set(-3, 10, -10);
          // this.model.add(dirLight);
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
          if (
            this.animateName != "" &&
            gltf.animations.some(
              (ani) => ani.name.toLowerCase() == this.animateName
            )
          ) {
            const specificAnim = gltf.animations.find(
              (ani) => ani.name.toLowerCase() == this.animateName
            );
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

  update() {
    if (!this.model) return;

    this.angle += 0.01;

    // Vị trí bay quanh địa cầu
    this.model.position.set(
      this.orbitRadius * Math.cos(this.angle),
      20 * Math.sin(this.angle * 2),
      this.orbitRadius * Math.sin(this.angle)
    );

    // Hướng đầu model theo quỹ đạo bay
    this.model.rotation.y = -this.angle + Math.PI / this.dir;

    // Cập nhật animation nếu có
    if (this.mixer) {
      const delta = this.clock.getDelta();
      this.mixer.update(delta);
    }
  }

  get object3D() {
    return this.model;
  }
}
