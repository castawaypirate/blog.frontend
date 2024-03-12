let loggedIn = true;
let menu;

document.addEventListener("DOMContentLoaded", function() {
  for (let m of document.querySelectorAll(".menu")) {
    m.style.display = "none";
  }
  if (loggedIn) {
    menu = document.querySelector(".user.menu");
  } else {
    menu = document.querySelector(".anonymous.menu");
  }
});

document.querySelector("#toggle-button").addEventListener("click", function() {
  if (menu.style.display === "flex") {
      menu.style.display = "none";
  } else {
      menu.style.display = "flex";
  }
});