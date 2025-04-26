import {
  editLocalStorage,
  getLocalStorage,
  USER_DATA,
  IS_LOGIN,
  removeLocalStorage,
  executeYesNoDialog,
} from "./utils.js";
// user btn

document.addEventListener("DOMContentLoaded", () => {
  const userMenuButton = document.getElementById("userMenuButton");
  const userDropdown = document.getElementById("userDropdown");
  const frameBtn = document.querySelector(".frame-btn");
  const frameSelectWrapper = document.getElementById("frame-select-wrapper");
  const frameList = document.getElementById("frame-list");
  const avatarFrameEl = document.getElementById("avatar-frame");
  const closeFrameTableBtn = document.querySelector(".close-frame-table-btn");
  const previewFrameWapper = document.querySelector(".preview-frame-wrapper");
  const logoutBtn = document.querySelector(".logout-btn");
  const userData = getLocalStorage(USER_DATA, {});

  (function () {
    // console.log(userData);
    if (Object.keys(userData).length > 0) {
      const { picture, name, avatarFrame } = userData;
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
      if (avatarFrame) {
        try {
          avatarFrameEl.src = avatarFrame;
          avatarFrameEl.classList.remove("hidden");
        } catch (error) {
          console.log("Error loading avatar frame: ", error);
          avatarFrameEl.classList.add("hidden");
        }
      }
    } else {
      window.localStorage.removeItem(USER_DATA);
      window.localStorage.removeItem(IS_LOGIN);
      window.location.href = "/auth.html";
    }
  })();

  // Toggle dropdown menu
  userMenuButton.addEventListener("click", (e) => {
    e.stopPropagation();
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

  const closeFrameTable = () => {
    frameSelectWrapper.classList.remove("scale-100", "opacity-100");
    frameSelectWrapper.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      frameSelectWrapper.classList.add("hidden");
    }, 150);
  };

  frameBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = frameSelectWrapper.classList.contains("hidden");
    if (isHidden) {
      frameSelectWrapper.classList.remove("hidden");
      setTimeout(() => {
        frameSelectWrapper.classList.remove("scale-95", "opacity-0");
        frameSelectWrapper.classList.add("scale-100", "opacity-100");
      }, 10);
    } else {
      closeFrameTable();
    }
  });

  closeFrameTableBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeFrameTable();
  });

  // Close frame select when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !frameSelectWrapper.contains(event.target) &&
      !frameSelectWrapper.classList.contains("hidden")
    ) {
      closeFrameTable();
    }
  });

  // Select frame function
  const selectFrame = (index) => {
    const urlFrame = `./assets/images/frames/frame_${index}.png`;
    const frameImgSelected = document.querySelector(`img[src="${urlFrame}"]`);
    const checkImage = frameImgSelected.nextElementSibling;
    if (checkImage && checkImage.tagName.toLowerCase() === "img") {
      checkImage.classList.remove("hidden");
    }
    const allCheckImages = frameList.querySelectorAll(".check-image");
    allCheckImages.forEach((img) => {
      if (img !== checkImage) {
        img.classList.add("hidden");
      }
    });
    avatarFrameEl.src = urlFrame;
    avatarFrameEl.classList.remove("hidden");
    editLocalStorage(USER_DATA, { avatarFrame: urlFrame });
    if (index === 30112001) {
      editLocalStorage(USER_DATA, { avatarFrame: "" });
      avatarFrameEl.classList.add("hidden");
    }
  };

  const showPreviewFrame = (index) => {
    const urlFrame = `./assets/images/frames/frame_${index}.png`;
    previewFrameWapper.classList.replace("hidden", "flex");
    const previewFrameImage = previewFrameWapper.querySelector("img");
    previewFrameImage.src = urlFrame;
    const hoverredImage = document.querySelector(`img[src="${urlFrame}"]`);
    const rectPreviewFrameWapper = previewFrameWapper.getBoundingClientRect();
    const rectHoverredImage = hoverredImage.getBoundingClientRect();
    previewFrameWapper.style.left =
      rectHoverredImage.left - rectPreviewFrameWapper.width + "px";
    previewFrameWapper.style.top = `${rectHoverredImage.top}px`;
  };

  const hidePreviewFrame = (index) => {
    previewFrameWapper.classList.replace("flex", "hidden");
  };

  window.selectFrame = selectFrame; // Populate frame list with images
  window.showPreviewFrame = showPreviewFrame;
  window.hidePreviewFrame = hidePreviewFrame;

  // frame avatar select
  frameList.insertAdjacentHTML(
    "beforeend",
    `<div
            class="frame-item w-[calc(100%/6)] mr-2 mt-2 rounded-full border border-gray-400"
            onclick="selectFrame(30112001)"
          >
            <img
              src="./assets/svgs/cancel-round.svg"
              alt="Frame selected"
              class="w-full h-w-full rounded-full object-cover"
            />
          </div>`
  );
  const frameCount = 59; // Number of frames
  Array(frameCount)
    .keys()
    .forEach((i) => {
      const isFrameSelected =
        userData.avatarFrame === `./assets/images/frames/frame_${i}.png`;
      const lastLetterOfIndexIsEquals3Or8 =
        String(i).charAt(String(i).length - 1) === "3" ||
        String(i).charAt(String(i).length - 1) === "8";
      const frameItemHtml = `<div class="${
        lastLetterOfIndexIsEquals3Or8 ? "" : "mr-2"
      } frame-item w-[calc(100%/6)] group relative rounded-full border border-gray-400" onclick="selectFrame(${i})" onmouseover="showPreviewFrame(${i})" onmouseout="hidePreviewFrame(${i})">
            <img
              src="./assets/images/frames/frame_${i}.png"
              alt="Frame selected"
              class="w-full h-full rounded-full object-cover"
            />
            <img
              src="./assets/svgs/check-one.svg"
              alt="check-image"
              class="absolute right-2 bottom-0 w-4 h-4 object-cover check-image ${
                isFrameSelected ? "" : "hidden"
              }"
            />
          </div>`;

      frameList.insertAdjacentHTML("beforeend", frameItemHtml);
    });

  const handleLogout = (e) => {
    e.preventDefault();
    executeYesNoDialog(
      () => {
        removeLocalStorage(USER_DATA);
        removeLocalStorage(IS_LOGIN);
        window.location.href = "/auth.html";
      },
      {
        title: "Logout?",
        message: "Are you sure you want to log out?",
      }
    );
  };
  logoutBtn.addEventListener("click", handleLogout);
});
