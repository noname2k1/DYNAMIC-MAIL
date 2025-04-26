// new diary form
const newDiaryBtn = document.querySelector(".new-diary");
const searchDiaryBtn = document.querySelector(".search-diary");
const bgGlobeBtn = document.querySelector(".bg-globe");
const closebtn = document.querySelector(".close-btn");
const Wrapper = document.getElementById("new-diary-form-wrapper");
const forms = document.querySelectorAll("form");
const newDiaryForm = Wrapper.querySelector("form");
const backgroundTable = document.querySelector(".background-table");

function handleFormClose() {
  Wrapper.classList.add("invisible");
  newDiaryForm.classList.add("hidden");
  backgroundTable.classList.add("hidden");
}

newDiaryBtn.addEventListener("click", function () {
  if (Wrapper.classList.contains("invisible")) {
    Wrapper.classList.remove("invisible");
    newDiaryForm.classList.remove("hidden");
  }
});

bgGlobeBtn.addEventListener("click", function () {
  if (Wrapper.classList.contains("invisible")) {
    Wrapper.classList.remove("invisible");
    backgroundTable.classList.remove("hidden");
  }
});

Wrapper.addEventListener("click", handleFormClose);
closebtn.addEventListener("click", (e) => {
  e.stopPropagation();
  Wrapper.classList.add("invisible");
  newDiaryForm.classList.add("hidden");
});

backgroundTable.addEventListener("click", (e) => {
  e.stopPropagation();
});
forms.forEach((form) => {
  form.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
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
    togglePassword.textContent = "Hide";
  } else {
    passwordInput.type = "password";
    togglePassword.textContent = "Show";
  }
});

const handleSending = (isSending) => {
  const sendText = document.querySelector(".send-text");
  const loadingGif = document.querySelector(".loading");
  sendText.classList.toggle("hidden", isSending);
  loadingGif.classList.toggle("hidden", !isSending);
};

newDiaryForm.addEventListener("submit", (e) => {
  if (yesRadio.checked && !passwordInput.value) {
    e.preventDefault();
    errorMsg.classList.remove("hidden");
  }
  const formData = new FormData(newDiaryForm);
  // const content = newDiaryForm.querySelector("#editable_content");
  // for (let [key, value] of formData.entries()) {
  //   console.log(`${key}: ${value}`);
  // }

  if (navigator.geolocation) {
    handleSending(true);
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const markerData = [...Array(1).keys()].map(() => ({
          lat,
          lng,
          size: 7 + Math.random() * 30,
          color: ["red", "white", "blue", "green"][
            Math.round(Math.random() * 3)
          ],
        }));
        window.world.htmlElementsData(markerData);
        handleSending(false);
        handleFormClose();
        window.world.pointOfView({ lat, lng, altitude: 0.4 }, 1000);
      },
      function (error) {
        alert(`Lỗi: ${error.message}`);
        handleSending(false);
      }
    );
  } else {
    alert("Your Browser doesn't support Geolocation.");
  }
});
