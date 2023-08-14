function logout() {
    // Clear the access token from local storage
    localStorage.removeItem("accessToken");
    window.location.replace("/")
  }
  
  // Add an event listener to the "Log Out" link
  document.getElementById("logout-link").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the default behavior of the link
    logout(); // Call the logout function
  });

  document.getElementById("profile-link").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the default behavior of the link
    // document.location = "profile.html";
    // window.location = "profile.html"
    console.log(window.location);
    console.log(window.location.href);
    console.log(document.location);
    window.location.assign("profile.html")
  });

  document.getElementById("messages-link").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the default behavior of the link
    window.location.assign("messages.html")
  });