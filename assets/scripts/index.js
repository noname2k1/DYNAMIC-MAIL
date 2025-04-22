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
      url: "./models/porcelain_protector_aurelion_sol.glb",
      speed: 0.015,
      scale: [0.03, 0.03, 0.03],
      animateName: "AurelionSol_runspin2.SKINS_AurelionSol_Skin31.anm",
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
