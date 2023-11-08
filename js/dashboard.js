import Auth from './auth.js';

async function checkUserLoginStatus() {
  let loggedIn = false;
  if (localStorage.getItem("accessToken")) {
    try {
      const authInstance = new Auth();
      const user = await authInstance.validateUser();
      if (user) {
        loggedIn = true;
      } else {
        loggedIn = false;
      }
    } catch (error) {
      loggedIn = false;
    }
  }
  return loggedIn;
}

document.addEventListener("DOMContentLoaded", async function() {
  const loggedIn = await checkUserLoginStatus();
  if(loggedIn){
    let userButton = document.getElementById("user-button");
    userButton.style.visibility = "visible";
  }
});

document.getElementById("add-button").addEventListener("click", async function (event) {
  event.preventDefault();
  const loggedIn = await checkUserLoginStatus();
  if(!loggedIn){
    localStorage.setItem("redirectedFromAddButton", "true");
    window.location.assign("access.html");
  }
  else{
    window.location.assign("create.html");
  }
});

function logout() {
  // Clear the access token from local storage
  localStorage.removeItem("accessToken");
  window.location.assign("dashboard.html")
}

// Add an event listener to the "Log Out" link
document.getElementById("logout-link").addEventListener("click", function (event) {
  event.preventDefault();
  logout();
});

document.getElementById("profile-link").addEventListener("click", function (event) {
  event.preventDefault();
  window.location.assign("profile.html")
});

document.getElementById("posts-link").addEventListener("click", function (event) {
  event.preventDefault();
  window.location.assign("posts.html")
});

document.getElementById("messages-link").addEventListener("click", function (event) {
  event.preventDefault();
  window.location.assign("messages.html")
});