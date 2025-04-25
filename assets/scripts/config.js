document.addEventListener("DOMContentLoaded", function () {
  const configGlobe = JSON.parse(
    window.localStorage.getItem("config-globe")
  ) || {
    rotation: true,
    speed: 0.1,
    labelColor: "rgba(255, 165, 0, 0.75)",
    labelResolution: 2,
    labelAltitude: 0.05,
  };
  let globeSelected = true;
  const imageCollection = document.querySelector(".image-collection");
  const globeImageTab = document.querySelector(".globe-image-tab");
  const bumpImageTab = document.querySelector(".bump-image-tab");
  const rotateGlobeSwitch = document.getElementById("rotation-globe");
  const labelColorPicker = document.getElementById("labelColor");
  const labelResolutionRange = document.getElementById("labelResolution");
  const labelAltitudeRange = document.getElementById("labelAltitude");
  const rotateGlobeSpeedRadioes = document.querySelectorAll(
    "input[name='rotation-globe-speed']"
  );

  const globeImageUrls = [
    "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg",
    "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg",
    "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg",
    "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg",
    "./assets/images/worldmaps/00.jpg",
    "./assets/images/worldmaps/01.png",
    "./assets/images/worldmaps/02.png",
    "./assets/images/worldmaps/03.jpg",
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

  const setConfigGlobe = (obj) => {
    window.localStorage.setItem(
      "config-globe",
      JSON.stringify({
        ...configGlobe,
        ...obj,
      })
    );
  };

  // handle rotate globe
  rotateGlobeSwitch.checked = configGlobe.rotation;
  rotateGlobeSwitch.addEventListener("change", function (e) {
    const rotation = e.target.checked;
    setConfigGlobe({ rotation });
    window.world.controls().autoRotate = rotation;
  });
  rotateGlobeSpeedRadioes.forEach((radio) => {
    if (radio.value == configGlobe.speed) {
      radio.checked = true;
    }
    radio.addEventListener("click", (e) => {
      const speed = +e.target.value;
      setConfigGlobe({ speed });
      window.world.controls().autoRotateSpeed = speed;
    });
  });
  labelColorPicker.value = configGlobe.labelColor;
  labelColorPicker.nextElementSibling.textContent = configGlobe.labelColor;
  labelResolutionRange.value = configGlobe.labelResolution;
  labelResolutionRange.nextElementSibling.textContent =
    configGlobe.labelResolution;
  labelAltitudeRange.value = configGlobe.labelAltitude;
  labelAltitudeRange.nextElementSibling.textContent = configGlobe.labelAltitude;

  // label color picker
  labelColorPicker.addEventListener("change", function (e) {
    const labelColor = e.target.value;
    setConfigGlobe({ labelColor });
    window.world.labelColor(() => labelColor);
  });

  // label resolution
  labelResolutionRange.addEventListener("change", function (e) {
    const labelResolution = +e.target.value;
    setConfigGlobe({ labelResolution });
    window.world.labelResolution(labelResolution);
  });

  /// label altitude
  labelAltitudeRange.addEventListener("change", function (e) {
    const labelAltitude = +e.target.value;
    setConfigGlobe({ labelAltitude });
    window.world.labelAltitude(labelAltitude);
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
