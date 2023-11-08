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

document.addEventListener("DOMContentLoaded", async function () {
    // Redirect to homepage (dashboard.html) if user is not logged in
    const loggedIn = await checkUserLoginStatus();
    if(!loggedIn){
        window.location.assign("dashboard.html");
    }

    const textarea = document.getElementById('postTitle');
    textarea.addEventListener('keydown', function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
        }
    });
});

document.getElementById('postForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;

    const data = {
        title: title,
        content: content
    };
    create(data);
});
  
async function create(data) {
    let accessToken = localStorage.getItem("accessToken");
    const options = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json', // Set the content type to JSON
        'Authorization': 'Bearer ' + accessToken,
        },
        body: JSON.stringify(data), // Convert the data to JSON format
    };

    try {
        const response = await fetch(`${config.apiUrl}/posts/create`, options);
        const result = await response.json();
        if (result.success) {
            window.location.assign("dashboard.html");
        }
    } catch (error) {
        throw new Error("Error: " + error);
    }
}