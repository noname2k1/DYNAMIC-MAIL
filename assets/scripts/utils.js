export const CONFIG_GLOBE = "config-globe";
export const USER_DATA = "user-data";
export const IS_LOGIN = "is-login";
const yesNoDialog = document.getElementById("dialog-yes-no");

export const setLocalStorage = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};
export const getLocalStorage = (key, defaultValue) => {
  const stored = window.localStorage.getItem(key);
  if (stored === null) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
};
export const editLocalStorage = (key, value) => {
  const stored = window.localStorage.getItem(key);
  if (stored === null) return;
  try {
    const parsed = JSON.parse(stored);
    window.localStorage.setItem(key, JSON.stringify({ ...parsed, ...value }));
  } catch {
    return;
  }
};

export const removeLocalStorage = (key) => {
  window.localStorage.removeItem(key);
};

export const configGlobe = getLocalStorage(CONFIG_GLOBE, {
  rotation: true,
  speed: 0.1,
  labelColor: "rgba(255, 165, 0, 0.75)",
  labelResolution: 2,
  labelAltitude: 0.05,
  globeImageUrl:
    "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg",
  bumpImageUrl:
    "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png",
});
export const setConfigGlobe = (obj) => {
  setLocalStorage(CONFIG_GLOBE, { ...configGlobe, ...obj });
};

export const executeYesNoDialog = (
  callback,
  dialogOption = {
    title: "Are you sure?",
    message: "Do you want to continue?",
  }
) => {
  yesNoDialog.querySelector("h3").textContent = dialogOption.title;
  yesNoDialog.querySelector("p").textContent = dialogOption.message;
  yesNoDialog.classList.remove("hidden");
  yesNoDialog.querySelector("#yes-btn").onclick = () => {
    callback();
    yesNoDialog.classList.add("hidden");
  };
  yesNoDialog.querySelector("#no-btn").onclick = () => {
    yesNoDialog.classList.add("hidden");
  };
};
