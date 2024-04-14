import config from "./config.js";


window.addEventListener("ready", function(e) {
  loadPosts();
});


async function loadPosts() {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  };

  try {

    let userVotes;
    if (window.userState.isLoggedIn) {
      userVotes = await getUserVotes();
    }
    
    const response = await fetch(`${config.apiUrl}/posts/getPosts`, options);
    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }
    const result = await response.json();

    if (result.success) {
      // use userVotes data to mark posts
      const formatDate = (date) => {
        const options = { day: "numeric", month: "short", year: "numeric" };
        const day = date.toLocaleString("en-US", { day: "numeric" });
        const month = date.toLocaleString("en-US", { month: "short" });
        const year = date.toLocaleString("en-US", { year: "numeric" });
        return `${day} ${month} ${year}`;
      };

      const postsContainer = document.querySelector("#posts-container");
      const ol = document.createElement("ol");

      result.posts.forEach(post => {
        const li = document.createElement("li");
        const postContainer = document.createElement("div");
        postContainer.className = "post-container";
        postContainer.setAttribute("data-post-id", post.id);

        const postTitle = document.createElement("h3");
        postTitle.className = "post-title";
        const postLink = document.createElement("a");
        postLink.id = "post-link";
        postLink.href = "";
        postLink.textContent = post.title;
        postTitle.appendChild(postLink);

        const postDetails = document.createElement("div");
        postDetails.className = "post-details";

        const upvotes = document.createElement("div");
        if (window.userState.isLoggedIn) {
          if(userVotes.upvotes.includes(post.id)) {
            upvotes.className = "upvotes-voted";
          } else {
            upvotes.className = "upvotes";
          }
          upvotes.addEventListener("click", function () {
            const data = {
              postId: post.id
            };
            upvotePost(this, data);
          });
        } else {
          upvotes.className = "upvotes-disabled";
        }

        const triangleUp = document.createElement("div");
        triangleUp.className = "triangle-up";
        const countUp = document.createElement("div");
        countUp.className = "count";
        countUp.textContent = post.upvotes;
        upvotes.appendChild(triangleUp);
        upvotes.appendChild(countUp);

        const downvotes = document.createElement("div");
        if (window.userState.isLoggedIn) {
          if(userVotes.downvotes.includes(post.id)) {
            downvotes.className = "downvotes-voted";
          } else {
            downvotes.className = "downvotes";
          }
          downvotes.addEventListener("click", function () {
            const data = {
              postId: post.id
            };
            downvotePost(this, data);
          });
        } else {
          downvotes.className = "downvotes-disabled";
        }

        const triangleDown = document.createElement("div");
        triangleDown.className = "triangle-down";
        const countDown = document.createElement("div");
        countDown.className = "count";
        countDown.textContent = post.downvotes;
        downvotes.appendChild(triangleDown);
        downvotes.appendChild(countDown);

        const created = document.createElement("div");
        created.className = "created";
        created.textContent = formatDate(new Date(post.created_at));

        const edited = document.createElement("div");
        edited.className = "edited";
        edited.textContent = formatDate(new Date(post.updated_at));

        const postCreator = document.createElement("div");
        postCreator.className = "post-creator";
        postCreator.textContent = post.username;

        const divider = document.createElement("div");
        divider.className = "post-details-divider";
        divider.textContent = "|";

        postDetails.appendChild(upvotes);
        postDetails.appendChild(divider.cloneNode(true));
        postDetails.appendChild(downvotes);
        postDetails.appendChild(divider.cloneNode(true));
        postDetails.appendChild(created);
        postDetails.appendChild(divider.cloneNode(true));
        postDetails.appendChild(edited);
        postDetails.appendChild(divider.cloneNode(true));
        postDetails.appendChild(postCreator);
        
        postContainer.appendChild(postTitle);
        postContainer.appendChild(postDetails);
        li.appendChild(postContainer);
        ol.appendChild(li);
      });

      postsContainer.appendChild(ol);
    } else {
      console.log(result);
    }
 } catch (error) {
    console.error("Error: ", error);
 }
}


async function getUserVotes() {
  const accessToken = localStorage.getItem("accessToken");
  const options = {
     method: "GET",
     headers: {
       "Content-Type": "application/json",
       "Authorization": "Bearer " + accessToken,
     }
  };
  try {
    const response = await fetch(`${config.apiUrl}/posts/getUserVotes`, options);
    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }
    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      console.log(result);
    }
  } catch (error) {
      console.error("Error: ", error);
  }
}


async function upvotePost(el, data) {
  const accessToken = localStorage.getItem("accessToken");
  const options = {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       "Authorization": "Bearer " + accessToken,
     },
     body: JSON.stringify(data),
  };
  
  try {
    const response = await fetch(`${config.apiUrl}/posts/upvote`, options);
    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }
    const result = await response.json();
    if (result.success) {
      console.log(result);
      if(result.action === "upvote") {
        const countElement = el.querySelector(".count");
        const currentCount = parseInt(countElement.textContent);
        countElement.textContent = currentCount + 1;
        el.className = "upvotes-voted";
      }
      if(result.action === "unvote") {
        const countElement = el.querySelector(".count");
        const currentCount = parseInt(countElement.textContent);
        countElement.textContent = currentCount - 1;
        el.className = "upvotes";
      }
    } else {
      console.log(result);
    }
  } catch (error) {
      console.error("Error: ", error);
  }
}
  

async function downvotePost(el, data) {
  const accessToken = localStorage.getItem("accessToken");
  const options = {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       "Authorization": "Bearer " + accessToken,
     },
     body: JSON.stringify(data),
  };
  
  try {
    const response = await fetch(`${config.apiUrl}/posts/downvote`, options);
    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }
    const result = await response.json();
    if (result.success) {
      console.log(result);
      if(result.action === "downvote") {
        const countElement = el.querySelector(".count");
        const currentCount = parseInt(countElement.textContent);
        countElement.textContent = currentCount + 1;
        el.className = "downvotes-voted";
      }
      if(result.action === "unvote") {
        const countElement = el.querySelector(".count");
        const currentCount = parseInt(countElement.textContent);
        countElement.textContent = currentCount - 1;
        el.className = "downvotes";
      }
    } else {
      console.log(result);
    }
  } catch (error) {
      console.error("Error: ", error);
  }
}
