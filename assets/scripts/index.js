import Globe from "https://esm.sh/globe.gl";
import { feature } from "https://esm.sh/topojson-client@3";
import { geoCentroid, geoContains } from "https://esm.sh/d3-geo@3";
import Model from "../../objects/Model.js";
import * as THREE from "three";
// import { OrbitControls } from "OrbitControls";
import { GLTFLoader } from "GLTFLoader";

const zoomDis = 0.5;
const countriesData = "./assets/jsons/countries_110m.json";
// https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json
const capitalData = "./assets/jsons/ne_110m_populated_places_simple.geojson";
// https://globe.gl/example/datasets/ne_110m_populated_places_simple.geojson
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
    .polygonAltitude(0.01)
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
  world.pointOfView({ lat: 0, lng: 0, altitude: 1.5 });

  // === Thêm mô hình quay quanh địa cầu ===
  const scene = world.scene();
  const globeRadius = world.getGlobeRadius?.() ?? 100;

  // Đèn chiếu
  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(200, 200, 200);
  scene.add(light);

  // Load mô hình .glb
  const clock = new THREE.Clock();

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
      url: "./models/killer_whale.glb",
      speed: 0.002,
      scale: [0.005, 0.005, 0.005],
      animateName: "Take 001",
      dir: 10,
      lighter: true,
      type: "swim",
    },
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
      config.lighter,
      config.type
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

document.addEventListener("DOMContentLoaded", function () {
  const userData = JSON.parse(window.localStorage.getItem("userData"));
  if (Object.keys(userData).length > 0) {
    const { picture, name } = userData;
    const avatar = picture;
    const userAvatarImageElement = document.querySelector(".user-avatar");
    const tempAvatarElement = document.querySelector(".temp-avatar");
    const userName = document.querySelector(".user-name");
    if (avatar) {
      userAvatarImageElement.src = avatar;
      userAvatarImageElement.classList.remove("hidden");
      tempAvatarElement.classList.add("hidden");
    } else {
      tempAvatarElement.textContent = name.charAt(0);
    }
    if (name.length > 20) {
      const newName = name.slice(0, 20);
      userName.textContent = newName + "...";
      userName.title = name;
    } else {
      userName.textContent = name;
    }
  } else {
    window.location.href = "/auth.html";
  }
});
