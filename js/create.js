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

document.querySelector("#post-title").addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
});

document.querySelector("#post-body").addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
});

function toggleLinkState() {
  var title = document.querySelector('#post-title').value.trim();
  var body = document.querySelector('#post-body').value.trim();
  var link = document.querySelector('#post-link');

  if (title !== "" && body !== "") {
      link.classList.remove('disabled-link');
      link.classList.add('enabled-link');
  } else {
      link.classList.remove('enabled-link');
      link.classList.add('disabled-link');
  }
}

// Attach event listeners to textareas
document.querySelector('#post-title').addEventListener('input', toggleLinkState);
document.querySelector('#post-body').addEventListener('input', toggleLinkState);


// import config from './config.js';
// import Auth from './auth.js';

// async function checkUserLoginStatus() {
//   let loggedIn = false;
//   if (localStorage.getItem("accessToken")) {
//     try {
//       const authInstance = new Auth();
//       const user = await authInstance.validateUser();
//       if (user) {
//         loggedIn = true;
//       } else {
//         loggedIn = false;
//       }
//     } catch (error) {
//       loggedIn = false;
//     }
//   }
//   return loggedIn;
// }

// document.addEventListener("DOMContentLoaded", async function () {
//     // Redirect to homepage (dashboard.html) if user is not logged in
//     const loggedIn = await checkUserLoginStatus();
//     if(!loggedIn){
//         window.location.assign("dashboard.html");
//     }

//     const textarea = document.getElementById('postTitle');
//     textarea.addEventListener('keydown', function (event) {
//         if (event.key === "Enter") {
//             event.preventDefault();
//         }
//     });
// });

// document.getElementById('postForm').addEventListener('submit', function(event) {
//     event.preventDefault();

//     const title = document.getElementById('postTitle').value;
//     const content = document.getElementById('postContent').value;

//     const data = {
//         title: title,
//         content: content
//     };
//     create(data);
// });
  
// async function create(data) {
//     let accessToken = localStorage.getItem("accessToken");
//     const options = {
//         method: 'POST',
//         headers: {
//         'Content-Type': 'application/json', // Set the content type to JSON
//         'Authorization': 'Bearer ' + accessToken,
//         },
//         body: JSON.stringify(data), // Convert the data to JSON format
//     };

//     try {
//         const response = await fetch(`${config.apiUrl}/posts/create`, options);
//         if (response.ok) {
//           const result = await response.json();
//           if (result.success) {
//               window.location.assign("dashboard.html");
//           } else {
//             console.log(response);
//           }
//         } else {
//           console.log(response);
//         }
//     } catch (error) {
//         throw new Error("Error: " + error);
//     }
// }