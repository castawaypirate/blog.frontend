import Auth from './auth.js';

// document.addEventListener("DOMContentLoaded", function() {
//     // document.querySelector("body").style.display = "none";
//     const auth = new Auth();

//     auth.validateToken(localStorage.getItem("accessToken"))
//         .then(isValidToken => {
//         if (isValidToken) {
//             // document.querySelector("body").style.display = "block";
//         } else {
//             window.location.replace("/access.html");
//         }
//         })
//         .catch(error => {
//         console.log("An error occurred:", error);
//         // Handle the error here if needed
//         });
//   });