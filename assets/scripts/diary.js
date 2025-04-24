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
