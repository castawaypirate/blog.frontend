import config from './config.js';
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
  // Redirect to homepage (dashboard.html) if user is logged in
  const loggedIn = await checkUserLoginStatus();
  if(loggedIn){
    window.location.assign("dashboard.html");
  }

  const redirectedFromAddButton = localStorage.getItem("redirectedFromAddButton");

  if (redirectedFromAddButton === "true") {
    const popup = document.getElementById("popup");

    // Display the popup
    popup.classList.add("show");

    // Automatically hide the popup after a set duration (e.g., 5 seconds)
    setTimeout(function() {
      popup.classList.remove("show");
    }, 3000); // 5000 milliseconds (5 seconds)

    // Clear the flag in localStorage
    localStorage.removeItem("redirectedFromAddButton");
  }
});


document.getElementById('accessForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const data = {
      username: username,
      password: password
  };
  access(data);
});


async function access(data) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Set the content type to JSON
    },
    body: JSON.stringify(data), // Convert the data to JSON format
  };

  try {
    const response = await fetch(`${config.apiUrl}/users/access`, options);
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        localStorage.setItem('accessToken', result.token);
        window.location.assign("dashboard.html");
      } else {
        console.log(result);
      }
    } else {
      console.log(response);
    }
    
  } catch (error) {
    throw new Error("Error: " + error);
  }
}