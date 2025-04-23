import Globe from "https://esm.sh/globe.gl";
import { feature } from "https://esm.sh/topojson-client@3";
import { geoCentroid } from "https://esm.sh/d3-geo@3";

import * as THREE from "three";
// import { OrbitControls } from "OrbitControls";
// import { GLTFLoader } from "GLTFLoader";

import Model from "../../objects/Model.js";

const zoomDis = 0.5;
const countriesData = "./assets/jsons/countries_110m.json";
const capitalData = "./assets/jsons/ne_110m_populated_places_simple.geojson";
const globImageUrl =
  "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg";
const bumpImageUrl =
  "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png";

let hoverPolygon = null;

Promise.all([
  fetch(countriesData).then((res) => res.json()),
  fetch(capitalData).then((res) => res.json()),
]).then(([worldData, places]) => {
  const world = new Globe(document.getElementById("globeViz"), {
    animateIn: false,
  })
    .globeImageUrl(globImageUrl)
    .bumpImageUrl(bumpImageUrl)

    // 🔹 Hiển thị tên thành phố
    .labelsData(places.features)
    .labelLat((d) => d.properties.latitude)
    .labelLng((d) => d.properties.longitude)
    .labelText((d) => d.properties.name)
    .labelSize((d) => Math.sqrt(d.properties.pop_max) * 4e-4)
    .labelDotRadius((d) => Math.sqrt(d.properties.pop_max) * 4e-4)
    .labelColor(() => "rgba(255, 165, 0, 0.75)")
    .labelResolution(2)
    .labelAltitude(0.05)

    // 🔹 Hiển thị ranh giới quốc gia
    .polygonsData(feature(worldData, worldData.objects.countries).features)
    .polygonCapColor((d) =>
      d === hoverPolygon ? "rgba(0,255,0,0.6)" : "rgba(0, 0, 0, 0)"
    )
    .polygonSideColor(() => "rgba(0, 100, 255, 0.15)")
    .polygonStrokeColor(() => "#111")
    .polygonLabel(({ properties: d }) => `<b>${d.name}</b>`)
    .onPolygonHover((d) => {
      hoverPolygon = d;
      document.body.style.cursor = d ? "pointer" : null;
      world.polygonsData(world.polygonsData()); // Force update
    })
    .onPolygonClick((polygon) => {
      const [lng, lat] = geoCentroid(polygon);
      world.pointOfView({ lat, lng, altitude: zoomDis }, 500);
    });

  world.controls().autoRotate = true;
  world.controls().autoRotateSpeed = 0.1;

  // === Thêm mô hình quay quanh địa cầu ===
  const scene = world.scene();
  const globeRadius = world.getGlobeRadius?.() ?? 100;

  // Đèn chiếu
  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(200, 200, 200);
  scene.add(light);

  // Load mô hình .glb
  const clock = new THREE.Clock();

  // const Spaceship = new Model(clock, "./models/spaceship.glb", globeRadius);
  // Spaceship.load(scene);

  const models = [];

  const modelConfigs = [
    // {
    //   url: "./models/white_chinese_dragon.glb",
    //   speed: 0.011,
    //   scale: [10, 10, 10],
    //   animateName: "walk",
    //   dir: 10,
    //   lighter: true,
    // },
    // {
    //   url: "./models/phoenix.glb",
    //   speed: 0.013,
    //   scale: [10, 10, 10],
    //   animateName: "walk",
    //   dir: 10,
    // },
    {
      url: "./models/mecha_aurelion_sol.glb",
      speed: 0.02,
      scale: [0.05, 0.05, 0.05],
      animateName: "AurelionSol_runspin2.anm",
      dir: 10,
      lighter: true,
    },
  ];

  // Tạo và load tất cả model
  modelConfigs.forEach((config) => {
    const model = new Model(
      clock,
      config.url,
      globeRadius,
      config.speed,
      config.scale,
      config.animateName,
      config.dir,
      config.lighter
    );
    model.load(scene);
    models.push(model);
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    models.forEach((model) => model.update(delta));
    // renderer.render(scene, camera);
  }
  animate();
});

function handleFormClose(e) {
  e.target.classList.add("invisible");
}

// new diary form
let newDiaryBtn = document.querySelector(".new-diary");
let closebtn = document.querySelector(".close-btn");
let newDiaryFormWrapper = document.getElementById("new-diary-form");
let forms = document.querySelectorAll("form");
newDiaryBtn.addEventListener("click", function () {
  if (newDiaryFormWrapper.classList.contains("invisible")) {
    newDiaryFormWrapper.classList.remove("invisible");
  }
});
newDiaryFormWrapper.addEventListener("click", handleFormClose);
closebtn.addEventListener("click", (e) => {
  e.stopPropagation();
  newDiaryFormWrapper.classList.add("invisible");
});
forms.forEach((form) => {
  form.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});

const yesRadio = document.getElementById("usePasswordYes");
const noRadio = document.getElementById("usePasswordNo");
const passwordField = document.getElementById("passwordField");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const errorMsg = document.getElementById("errorMsg");

yesRadio.addEventListener("change", () => {
  passwordField.classList.remove("hidden");
});

noRadio.addEventListener("change", () => {
  passwordField.classList.add("hidden");
  errorMsg.classList.add("hidden");
});

togglePassword.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglePassword.textContent = "Ẩn";
  } else {
    passwordInput.type = "password";
    togglePassword.textContent = "Hiện";
  }
});

document.getElementById("confessionForm").addEventListener("submit", (e) => {
  if (yesRadio.checked && !passwordInput.value) {
    e.preventDefault();
    errorMsg.classList.remove("hidden");
  }
});

// user btn

document.addEventListener("DOMContentLoaded", () => {
  const userMenuButton = document.getElementById("userMenuButton");
  const userDropdown = document.getElementById("userDropdown");

  // Toggle dropdown menu
  userMenuButton.addEventListener("click", () => {
    const isHidden = userDropdown.classList.contains("hidden");
    if (isHidden) {
      userDropdown.classList.remove("hidden");
      setTimeout(() => {
        userDropdown.classList.remove("scale-95", "opacity-0");
        userDropdown.classList.add("scale-100", "opacity-100");
      }, 10);
    } else {
      userDropdown.classList.remove("scale-100", "opacity-100");
      userDropdown.classList.add("scale-95", "opacity-0");
      setTimeout(() => {
        userDropdown.classList.add("hidden");
      }, 150);
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !userMenuButton.contains(event.target) &&
      !userDropdown.contains(event.target)
    ) {
      if (!userDropdown.classList.contains("hidden")) {
        userDropdown.classList.remove("scale-100", "opacity-100");
        userDropdown.classList.add("scale-95", "opacity-0");
        setTimeout(() => {
          userDropdown.classList.add("hidden");
        }, 150);
      }
    }
  });
});
