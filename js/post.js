import config from "./config.js";
import { load404Template } from './router.js';

window.addEventListener("loadPost", function(e) {
  const postId = window.location.pathname.split("/").pop();
  loadPost(postId)
});

async function loadPost(postId) {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  };

  const response = await fetch(`${config.apiUrl}/posts/getPost?postId=${postId}`, options)
  if (!response.ok) {
    throw new Error("Network response was not ok.");
  }
  
  const result = await response.json();
  if (result.success) {
    const post = result.post;
    const postContainer = document.querySelector(".post-container");
    // replace newline characters with <br> tags
    const formattedTitle = post.title.replace(/\n/g, "<br>");
    const formattedBody = post.body.replace(/\n/g, "<br>");
    postContainer.innerHTML = `
        <h2 id="post-title">${formattedTitle}</h2>
        <div id="post-body">${formattedBody}</div>`;
  }else {
    console.error("Post not found.");
    load404Template().then(() => {
      console.log("404 template loaded due to error.");
    }).catch(error => {
      console.error("Don't look at me bro!");
    });
  }
}
