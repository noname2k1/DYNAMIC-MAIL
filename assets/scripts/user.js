// user btn

document.addEventListener("DOMContentLoaded", () => {
  const userMenuButton = document.getElementById("userMenuButton");
  const userDropdown = document.getElementById("userDropdown");

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
});
