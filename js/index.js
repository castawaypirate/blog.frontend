import config from "./config.js";
let menu;
let loggedIn = false;

window.userState = {
  isLoggedIn: false
};


async function validateUser() {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
     return false;
  }
 
  const options = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + accessToken,
    },
  };
 
  try {
    const response = await fetch(`${config.apiUrl}/users/validateUser`, options);
    if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log(result);
          window.userState.isLoggedIn = true;
          return true;
        } else {
          console.log(result);
          return false;
        }
    } else {
        console.log(response);
        return false;
    }
  } catch (error) {
      console.error("Response status: " + response.status + "Failed to fetch data from the server:" + error.message);
      return false;
  }
}


async function loadMenu() {
  if (loggedIn) {
    menu = document.querySelector(".user.menu");
  } else {
    menu = document.querySelector(".anonymous.menu");
  }
}


document.addEventListener("DOMContentLoaded", async function() {
  try {
    loggedIn = await validateUser();
  } catch(e) {
    loggedIn = false;
  }
  loadMenu();
  setTimeout(dispatchCustomEvent, 100);
});

let customEvent = new CustomEvent("ready", {
  detail: {
     message: "index.js has been fully loaded and executed."
  }
 });
 
 function dispatchCustomEvent() {
  window.dispatchEvent(customEvent);
 }


document.querySelector("#toggle-button").addEventListener("click", function() {
    if (menu.style.display === "flex") {
        menu.style.display = "none";
    } else {
        menu.style.display = "flex";
    }
});


document.querySelector("#logout-link").addEventListener("click", logout);


async function logout() {
  // remove the access token from local storage
  localStorage.removeItem('accessToken');
   
  // update the application state to reflect that the user is no longer logged in
  window.userState.isLoggedIn = false;
   
  await validateUser();

  window.location.href = "/";
}