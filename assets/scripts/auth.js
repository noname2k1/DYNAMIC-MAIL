import {
  getLocalStorage,
  setLocalStorage,
  USER_DATA,
  IS_LOGIN,
} from "./utils.js";
import Globe from "https://esm.sh/globe.gl";
const globImageUrl =
  "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg";
const bumpImageUrl =
  "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png";

if (getLocalStorage(IS_LOGIN, false)) {
  window.location.href = "/"; // Thay bằng đường dẫn trang chính của bạn
}

const world = new Globe(document.getElementById("globeViz"), {
  animateIn: false,
})
  .globeImageUrl(globImageUrl)
  .bumpImageUrl(bumpImageUrl);

world.controls().autoRotate = true;
world.controls().autoRotateSpeed = 0.6;
world.pointOfView({ lat: 0, lng: 0, altitude: 1.5 });

// form handle
function loginWith(provider) {
  alert(`Redirecting to ${provider} login...`);
}

window.loginWith = loginWith;

document.addEventListener("DOMContentLoaded", () => {
  const loginTab = document.getElementById("tab-login");
  const registerTab = document.getElementById("tab-register");

  loginTab.addEventListener("click", () => showTab("login"));
  registerTab.addEventListener("click", () => showTab("register"));

  showTab("login"); // mặc định chọn login tab
});

function showTab(tab) {
  const loginTab = document.getElementById("tab-login");
  const registerTab = document.getElementById("tab-register");
  const loginForm = document.getElementById("form-login");
  const registerForm = document.getElementById("form-register");
  const indicator = document.getElementById("tab-indicator");

  let activeTab;

  if (tab === "login") {
    loginTab.classList.remove("opacity-70");
    registerTab.classList.add("opacity-70");
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    activeTab = loginTab;
  } else {
    registerTab.classList.remove("opacity-70");
    loginTab.classList.add("opacity-70");
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    activeTab = registerTab;
  }

  // 🟢 Tính chiều rộng và vị trí theo tab đang active
  const tabRect = activeTab.getBoundingClientRect();
  const parentRect = activeTab.parentElement.getBoundingClientRect();
  indicator.style.width = tabRect.width + "px";
  indicator.style.left = tabRect.left - parentRect.left + "px";
}

// Khi load xong trang, set vị trí gạch
window.addEventListener("DOMContentLoaded", () => {
  const loginTab = document.getElementById("tab-login");
  const indicator = document.getElementById("tab-indicator");

  indicator.style.left = `${loginTab.offsetLeft}px`;
  indicator.style.width = `${loginTab.offsetWidth}px`;
});

const signInBtn = document.getElementById("sign_in_btn");
const signUpBtn = document.getElementById("sign_up_btn");

signInBtn.addEventListener("click", function () {
  alert("This feature coming soon");
});
signUpBtn.addEventListener("click", function () {
  alert("This feature coming soon");
});

function handleCredentialResponse(response) {
  try {
    const token = response.credential;
    function parseJwt(token) {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    }
    const decoded = parseJwt(token);
    const { aud, azp, exp, iat, nbf, email_verified, ...userData } = decoded;
    userData.avatar_frame = "";
    setLocalStorage(USER_DATA, userData);
    setLocalStorage(IS_LOGIN, true);
    window.location.href = "/";
  } catch (error) {
    console.log("auth_error: " + error);
  }
}

window.handleCredentialResponse = handleCredentialResponse;
