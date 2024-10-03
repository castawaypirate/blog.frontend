import config from "./config.js";

document.querySelector("#update-title").addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
});

document.querySelector("#update-body").addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
});

function toggleLinkState() {
  const title = document.querySelector("#update-title").value.trim();
  const body = document.querySelector("#update-body").value.trim();
  const link = document.querySelector("#update-button");

  if (title !== "" && body !== "") {
      link.classList.remove("disabled");
      link.classList.add("enabled");
  } else {
      link.classList.remove("enabled");
      link.classList.add("disabled");
  }
}

document.querySelector("#update-title").addEventListener("input", toggleLinkState);
document.querySelector("#update-body").addEventListener("input", toggleLinkState);

window.addEventListener("fetchPostToEdit", function(e) {
  setTimeout(function() {}, 100);
  const postId = window.location.pathname.split("/").pop();
  loadPostToEdit(postId);
});

async function loadPostToEdit(postId) {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  };

  const response = await fetch(`${config.apiUrl}/posts/getPost?postId=${postId}`, options)
  if (response.ok) {
    const result = await response.json();
    if (result.success) {
      console.log(result);
      const title = document.querySelector("#update-title");
      const body = document.querySelector("#update-body");
      title.value = result.post.title;
      body.value = result.post.body;
      title.style.height = 'auto';
      title.scrollHeight; // trigger reflow (flushing the layout)
      title.style.height = `${title.scrollHeight}px`;
      body.style.height = 'auto';
      body.scrollHeight;
      body.style.height = `${body.scrollHeight}px`;
    } else {
      console.error("Post not found.");
      load404Template().then(() => {
        console.log("404 template loaded due to error.");
      }).catch(error => {
        console.error("Don't look at me bro!");
      });
    }
  } else {
    console.log(response);
  }
}

document.querySelector("#update-form").addEventListener("submit", async function(event) {
  event.preventDefault();

  const title = document.querySelector("#update-title").value;
  const body = document.querySelector("#update-body").value;

  if (!title ||!body) {
    console.log('Either title or body is empty.');
    return;
  }

  const data = {
      title: title,
      body: body
  };

  const postId = window.location.pathname.split("/").pop();
  await update(data, postId);
});
  
async function update(data, postId) {
  let accessToken = localStorage.getItem("accessToken");
  const options = {
      method: "PUT",
      headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + accessToken,
      },
      body: JSON.stringify(data),
  };

  try {
      const response = await fetch(`${config.apiUrl}/posts/edit?postId=${postId}`, options);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          let form = document.querySelector("#update-form");
          form.submit();
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
