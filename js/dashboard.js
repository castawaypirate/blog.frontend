import Auth from './auth.js';
import config from './config.js';

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
  // check if user is logged in
  const loggedIn = await checkUserLoginStatus();
  if(loggedIn){
    let userButton = document.getElementById("user-button");
    userButton.style.visibility = "visible";
  }

  // load posts
  const storedPage = localStorage.getItem('currentPage');
  loadPosts(storedPage ? Number(storedPage) : 1);
});

async function loadPosts(pageNumber = 1) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json', // Set the content type to JSON
    }
  };
  
  let url = `${config.apiUrl}/posts/getPosts?pageNumber=${pageNumber}`;
  
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      const result = await response.json();
      let totalPages = result.totalPages;
      let currentPage = result.pageNumber;
      localStorage.setItem('currentPage', currentPage);
      console.log(result);

      let postContainer = document.getElementById('post-container');
      postContainer.innerHTML = ''; // Clear out the previous posts
      for (let post of result.posts) {
          let postTitle = document.createElement('h2');
          postTitle.textContent = post.title;
          postContainer.appendChild(postTitle);
      }
      // Enable or disable the previous and next buttons based on the current page number
      document.getElementById('prev-button').disabled = currentPage === 1;
      document.getElementById('next-button').disabled = currentPage === totalPages;
    } else {
      console.log(response);
    }
  } catch (error) {
    throw new Error("Error: " + error);
  }
}

document.getElementById("prev-button").addEventListener("click", function (event) {
  event.preventDefault();
  const currentPage = localStorage.getItem('currentPage');
  loadPosts(parseInt(currentPage) - 1);
});

document.getElementById("next-button").addEventListener("click", function (event) {
  event.preventDefault();
  const currentPage = localStorage.getItem('currentPage');
  loadPosts(parseInt(currentPage) + 1);
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

