import Globe from "https://esm.sh/globe.gl";
import { feature } from "https://esm.sh/topojson-client@3";
import { geoCentroid, geoContains } from "https://esm.sh/d3-geo@3";
import Model from "../../objects/Model.js";
import * as THREE from "three";
// import { OrbitControls } from "OrbitControls";
// import { GLTFLoader } from "GLTFLoader";

const globeRotation = JSON.parse(
  window.localStorage.getItem("rotation-globe")
) || {
  enabled: true,
  speed: 0.1,
};

let globeSelected = true;
const imageCollection = document.querySelector(".image-collection");
const globeImageTab = document.querySelector(".globe-image-tab");
const bumpImageTab = document.querySelector(".bump-image-tab");
const zoomDis = 0.5;
const countriesData = "./assets/jsons/countries_110m.json";
// https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json
const capitalData = "./assets/jsons/ne_110m_populated_places_simple.geojson";
// https://globe.gl/example/datasets/ne_110m_populated_places_simple.geojson

const globeImageUrls = [
  "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg",
  "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg",
  "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg",
  "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg",
];

const bumpImageUrls = [
  "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png",
  "https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png",
  "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-water.png",
];

const renderImagesHTML = (imageArray) => {
  return imageArray.reduce((prev, curr, currIndex, arr) => {
    return (
      prev +
      `<div
              class="${
                globeSelected ? "globe-image-item" : "bump-image-item"
              } w-48 h-32 overflow-hidden rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 relative"
            >
              <img
                src="${curr}"
                alt="image-${currIndex}"
                class="w-full h-full object-cover"
              />
              <img
                src="./assets/svgs/check-one.svg"
                alt="image-${currIndex}"
                class="absolute right-3 bottom-3 w-8 h-8 object-cover hidden check-image"
              />
            </div>`
    );
  }, "");
};

function handleTabSwitch(activeTab, inactiveTab, imageUrls, isGlobe) {
  activeTab.classList.remove("not-active-tab");
  inactiveTab.classList.add("not-active-tab");
  globeSelected = isGlobe;
  imageCollection.innerHTML = renderImagesHTML(imageUrls);
}

globeImageTab.addEventListener("click", () => {
  handleTabSwitch(globeImageTab, bumpImageTab, globeImageUrls, true);
});

bumpImageTab.addEventListener("click", () => {
  handleTabSwitch(bumpImageTab, globeImageTab, bumpImageUrls, false);
});

imageCollection.innerHTML = renderImagesHTML(globeImageUrls);

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
    // .showGlobe(false)
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
      const markerSvg = `<svg viewBox="-4 0 36 36">
<path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
<circle fill="black" cx="14" cy="14" r="7"></circle>
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
    );

  world.controls().autoRotate = globeRotation.enabled;
  world.controls().autoRotateSpeed = globeRotation.speed;
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
    window.location.href = "/auth.html";
  }

  // handle rotate globe
  const rotateGlobeSwitch = document.getElementById("rotation-globe");
  const rotateGlobeSpeedRadioes = document.querySelectorAll(
    "input[name='rotation-globe-speed']"
  );
  rotateGlobeSwitch.checked = globeRotation.enabled;
  rotateGlobeSwitch.addEventListener("change", function (e) {
    const checked = e.target.checked;
    window.localStorage.setItem(
      "rotation-globe",
      JSON.stringify({
        ...globeRotation,
        enabled: checked,
      })
    );
    window.world.controls().autoRotate = checked;
  });
  rotateGlobeSpeedRadioes.forEach((radio) => {
    if (radio.value == globeRotation.speed) {
      radio.checked = true;
    }
    radio.addEventListener("click", (e) => {
      const speed = +e.target.value;
      window.localStorage.setItem(
        "rotation-globe",
        JSON.stringify({
          ...globeRotation,
          speed,
        })
      );
      window.world.controls().autoRotateSpeed = speed;
    });
  });

  // handle image collection
  imageCollection.addEventListener("click", (event) => {
    if (
      event.target &&
      event.target.matches("img") &&
      !event.target.matches(".check-image")
    ) {
      const imgSrc = event.target.src;
      globeSelected
        ? window.world.globeImageUrl(imgSrc)
        : window.world.bumpImageUrl(imgSrc);
      const checkImage = event.target.nextElementSibling;
      if (checkImage && checkImage.tagName.toLowerCase() === "img") {
        checkImage.classList.remove("hidden");
      }
      const allCheckImages = imageCollection.querySelectorAll(".check-image");
      allCheckImages.forEach((img) => {
        if (img !== checkImage) {
          img.classList.add("hidden");
        }
      });
    }
  });
});
