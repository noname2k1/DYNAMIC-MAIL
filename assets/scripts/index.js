import Globe from "https://esm.sh/globe.gl";
import { feature } from "https://esm.sh/topojson-client@3";
import { geoCentroid, geoContains } from "https://esm.sh/d3-geo@3";
import Model from "../../objects/Model.js";
import * as THREE from "three";
// import { OrbitControls } from "OrbitControls";
// import { GLTFLoader } from "GLTFLoader";

const configGlobe = JSON.parse(window.localStorage.getItem("config-globe")) || {
  rotation: true,
  speed: 0.1,
  labelColor: "rgba(255, 165, 0, 0.75)",
  labelResolution: 2,
  labelAltitude: 0.05,
};

const loadingGlobe = document.querySelector(".loading-globe");
const explosion = document.querySelector(".explosion");
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
    rendererConfig: {
      antialias: true,
      alpha: true,
    },
  })
    .globeImageUrl(globImageUrl)
    .bumpImageUrl(bumpImageUrl)

    // .showAtmosphere(true)
    // .showGlobe(false)
    // 🔹 Hiển thị tên thành phố
    .labelsData(places.features)
    .labelLat((d) => d.properties.latitude)
    .labelLng((d) => d.properties.longitude)
    .labelText((d) => d.properties.name)
    .labelSize((d) => Math.sqrt(d.properties.pop_max) * 4e-4)
    // .labelDotRadius((d) => Math.sqrt(d.properties.pop_max) * 4e-4)
    .labelColor(() => configGlobe.labelColor)
    .labelResolution(configGlobe.labelResolution)
    .labelAltitude(configGlobe.labelAltitude)

    // 🔹 Hiển thị ranh giới quốc gia
    .polygonsData(feature(worldData, worldData.objects.countries).features)
    .polygonCapColor((d) =>
      d === hoverPolygon ? "rgba(0,255,0,0.6)" : "rgba(0, 0, 0, 0)"
    )
    .polygonSideColor(() => "rgba(0, 100, 255, 0.15)")
    .polygonStrokeColor(() => "#111")
    .polygonLabel(({ properties: d }) => `<b>${d.name}</b>`)
    // .polygonAltitude((d) => (d === hoverPolygon ? 0.03 : 0))
    .onPolygonHover((d) => {
      hoverPolygon = d;
      document.body.style.cursor = d ? "pointer" : null;
      world.polygonsData(world.polygonsData()); // Force update
    })
    .onPolygonClick((polygon) => {
      const [lng, lat] = geoCentroid(polygon);
      world.pointOfView({ lat, lng, altitude: zoomDis }, 500);
    })
    .htmlElement((d) => {
      const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 256 256" enable-background="new 0 0 256 256" xml:space="preserve">
<metadata> Svg Vector Icons : http://www.onlinewebfonts.com/icon </metadata>
<g><g><g><path fill="#000000" d="M119,10.3c-18.9,2-37.1,10-51.1,22.5C56.6,42.8,47.5,56.3,42.6,70.4c-9.5,27.2-5.8,55.2,10.8,83.1c7.2,12.1,16.8,24.2,37.2,47.1c17.1,19.2,29.4,34.3,34.8,42.8c2.2,3.4,3.1,3.4,5.4-0.1c2.5-3.9,12.6-17.2,18.1-23.7c2.9-3.4,10.6-12.3,17.2-19.7c16.9-19.1,23-26.4,29.9-36c17-23.8,24.8-49.1,22.2-72.7c-4.4-40.6-34.7-73-74.7-79.9C136.7,10.1,125.1,9.7,119,10.3z M177,66.9c-4,3.9-48.3,40.4-49,40.4S83.1,70.8,79,66.9c-0.9-0.9-0.1-0.9,49-0.9C177.1,65.9,177.9,65.9,177,66.9z M92.4,84.9c9.8,8.3,17.9,15.3,17.8,15.5c-0.1,0.2-7.9,6.8-17.4,14.8c-9.5,7.9-17.6,14.8-18.1,15.2c-0.8,0.7-0.9-0.7-0.9-29.8c0-16.8,0.1-30.6,0.2-30.6S82.5,76.7,92.4,84.9z M182.2,100.5c0,29.1,0,30.5-0.8,29.8c-0.5-0.4-8.6-7.2-18.1-15.2c-9.5-7.9-17.2-14.7-17.2-14.9c0-0.5,35.2-30.3,35.8-30.3C182,69.9,182.2,83.7,182.2,100.5z M119,107.3c5,4.2,6.2,4.9,9,4.9s4-0.6,9.1-4.9c3.7-3.2,4.3-3.5,5-2.9c6.4,5.2,35.4,29.7,35.5,30c0.1,0.2-21.1,0.4-49.6,0.4c-28.7,0-49.7-0.2-49.6-0.4c0.1-0.4,35.9-30.6,36.3-30.6C114.8,103.8,116.7,105.4,119,107.3z"/></g></g></g>
</svg>`;
      const el = document.createElement("div");
      el.innerHTML = markerSvg;
      el.style.color = d.color;
      el.style.width = `${d.size}px`;
      el.style.transition = "opacity 250ms";

      el.style["pointer-events"] = "auto";
      el.style.cursor = "pointer";
      el.onclick = () => console.info(d);
      return el;
    })
    .htmlElementVisibilityModifier(
      (el, isVisible) => (el.style.opacity = isVisible ? 1 : 0)
    )
    .onGlobeReady(() => {
      loadingGlobe.classList.add("hidden");
      setTimeout(() => {
        explosion.classList.add("hidden");
      }, 1000);
    });

  world.controls().autoRotate = configGlobe.rotation;
  world.controls().autoRotateSpeed = configGlobe.speed;
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
  window.world = world;
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
    window.localStorage.removeItem("userData");
    window.localStorage.removeItem("isLogin");
    window.location.href = "/auth.html";
  }
});
