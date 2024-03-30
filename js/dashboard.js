import config from "./config.js";

async function loadPosts() {
    const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      };
    
      fetch(`${config.apiUrl}/posts/getPosts`, options)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok.');
          }
          return response.json();
        })
        .then(result => {
          if (result.success) {
            console.log(result);
          } else {
            console.log(result);
          }
        })
        .catch(error => {
          console.error("Error: ", error);
        });
}

if (document.readyState !== 'loading') {
    loadPosts();
} else {
    document.addEventListener('DOMContentLoaded', loadPosts);
}
  
