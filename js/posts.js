import config from "./config.js";

window.addEventListener("loadUserPosts", function(e) {
  setTimeout(function() {}, 100);
  const storedPage = localStorage.getItem("currentUserPage");
  if (storedPage) {
    loadUserPosts(storedPage);
  } else {
    loadUserPosts(1);
  }
});

document.querySelector("#previous").addEventListener("click", function (event) {
  event.preventDefault();
  const currentUserPage = localStorage.getItem("currentUserPage");
  loadUserPosts(parseInt(currentUserPage) - 1);
});

document.querySelector("#next").addEventListener("click", function (event) {
  event.preventDefault();
  const currentUserPage = localStorage.getItem("currentUserPage");
  loadUserPosts(parseInt(currentUserPage) + 1);
});

async function loadUserPosts(pageNumber) {
  const accessToken = localStorage.getItem("accessToken");
  const options = {
     method: "GET",
     headers: {
       "Content-Type": "application/json",
       "Authorization": "Bearer " + accessToken,
     }
  };

  try {
    let userVotes;

    const response = await fetch(`${config.apiUrl}/posts/getUserPosts?pageNumber=${pageNumber}`, options);
    if (response.ok) {
      const result = await response.json();
      console.log(result);
      let totalPages = result.totalPages;
      let currentUserPage = result.pageNumber;
      localStorage.setItem("currentUserPage", currentUserPage);
      if (totalPages > 1) {
        let pagination = document.querySelector("#pagination");
        if (pagination.classList.contains("disabled")) {
          pagination.classList.remove("disabled");
        }

        let previous = document.querySelector("#previous");
        let next = document.querySelector("#next");

        if (previous.classList.contains("disabled")) {
          previous.classList.remove("disabled");
        }

        if (next.classList.contains("disabled")) {
          next.classList.remove("disabled");
        }

        let paginationDivider = document.querySelector("#pagination-divider");
        paginationDivider.style.display = "block";

        if (currentUserPage === 1) {
          previous.className = "disabled";
          paginationDivider.style.display = "none";
        }

        if (currentUserPage === totalPages || result.posts.length === 0) {
          next.className = "disabled";
          paginationDivider.style.display = "none";
        }
      } else if (totalPages === 1) {
        let pagination = document.querySelector("#pagination");
        pagination.style.display = "none";
      }
      if (result.success && result.posts) {
        const formatDate = (date) => {
          const options = {day: "numeric", month: "short", year: "numeric"};
          const day = date.toLocaleString("en-US", {day: "numeric"});
          const month = date.toLocaleString("en-US", {month: "short"});
          const year = date.toLocaleString("en-US", {year: "numeric"});
          return `${day} ${month} ${year}`;
        };

        userVotes = await getUserVotes();

        const postsContainer = document.querySelector("#posts-container");
        postsContainer.innerHTML = "";
        const ol = document.createElement("ol");

        // keep counting
        const startNumber = (pageNumber - 1) * config.postsPerPage + 1;
        ol.setAttribute("start", startNumber);

        result.posts.forEach(post => {
          const li = document.createElement("li");
          const postContainer = document.createElement("div");
          postContainer.className = "post-container";
          postContainer.setAttribute("data-post-id", post.id);

          const postTitle = document.createElement("h3");
          postTitle.className = "post-title";
          const postLink = document.createElement("a");
          postLink.id = "post-link";
          postLink.href = `/post/${post.id}`;
          postLink.textContent = post.title;
          postTitle.appendChild(postLink);

          const postDetails = document.createElement("div");
          postDetails.className = "post-details";

          const upvotes = document.createElement("div");
          if (userVotes.upvotes.includes(post.id)) {
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

          const triangleUp = document.createElement("div");
          triangleUp.className = "triangle-up";
          const countUp = document.createElement("div");
          countUp.className = "upvotes-count";
          countUp.textContent = post.upvotes;
          upvotes.appendChild(triangleUp);
          upvotes.appendChild(countUp);

          const downvotes = document.createElement("div");
          if (userVotes.downvotes.includes(post.id)) {
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

          const triangleDown = document.createElement("div");
          triangleDown.className = "triangle-down";
          const countDown = document.createElement("div");
          countDown.className = "downvotes-count";
          countDown.textContent = post.downvotes;
          downvotes.appendChild(triangleDown);
          downvotes.appendChild(countDown);

          const created = document.createElement("div");
          created.className = "created";
          created.textContent = formatDate(new Date(post.created_at));

          const edited = document.createElement("div");
          edited.className = "edited";
          edited.textContent = formatDate(new Date(post.updated_at));

          const editDiv = document.createElement("div");
          editDiv.className = "edit";
          editDiv.textContent = "edit";
          editDiv.addEventListener('click', function () {
            window.location.href = `/edit/${post.id}`;
          });

          const deleteDiv = document.createElement("div");
          deleteDiv.addEventListener("click", function () {
            const data = {
              postId: post.id
            };
            postDetails.style.display = "none";

            const approvalButtonsContainer = document.createElement("div");
            approvalButtonsContainer.className = "post-details";

            const sure = document.createElement("div");
            sure.className = "sure-button";
            sure.textContent = "sure";

            const nah = document.createElement("div");
            nah.className = "nah-button";
            nah.textContent = "nah";

            approvalButtonsContainer.appendChild(sure);
            approvalButtonsContainer.appendChild(divider.cloneNode(true));
            approvalButtonsContainer.appendChild(nah);
            postContainer.appendChild(approvalButtonsContainer);

            sure.addEventListener("click", async function (event) {
              await deletePost(data, event);
            });
            nah.addEventListener("click", function (event) {
              cancel(postDetails, postContainer, approvalButtonsContainer, event);
            });
          });

          deleteDiv.className = "delete";
          deleteDiv.textContent = "delete";

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
          postDetails.appendChild(editDiv);
          postDetails.appendChild(divider.cloneNode(true));
          postDetails.appendChild(deleteDiv);

          postContainer.appendChild(postTitle);
          postContainer.appendChild(postDetails);
          li.appendChild(postContainer);
          ol.appendChild(li);
        });

        postsContainer.appendChild(ol);
      } else {
        console.log(result);
      }
    } else {
      console.log(response);
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
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        console.log(result);
      }
    } else {
      console.log(response);
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
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        if (result.action === "upvote") {
          const countElement = el.querySelector(".upvotes-count");
          const currentCount = parseInt(countElement.textContent);
          countElement.textContent = currentCount + 1;
          el.className = "upvotes-voted";
        } else if (result.action === "unvote") {
          const countElement = el.querySelector(".upvotes-count");
          const currentCount = parseInt(countElement.textContent);
          countElement.textContent = currentCount - 1;
          el.className = "upvotes";
        } else {
          const downvotesCountElement = el.parentElement.querySelector(".downvotes-count");
          const downvotesCount = parseInt(downvotesCountElement.textContent);
          downvotesCountElement.textContent = downvotesCount - 1;
          const downvotes = el.parentElement.querySelector(".triangle-down").parentElement;
          downvotes.className = "downvotes";
          const countElement = el.querySelector(".upvotes-count");
          const currentCount = parseInt(countElement.textContent);
          countElement.textContent = currentCount + 1;
          el.className = "upvotes-voted";
        }
      } else {
        console.log(result);
      }
    } else {
      console.log(response);
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
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        if (result.action === "downvote") {
          const countElement = el.querySelector(".downvotes-count");
          const currentCount = parseInt(countElement.textContent);
          countElement.textContent = currentCount + 1;
          el.className = "downvotes-voted";
        } else if (result.action === "unvote") {
          const countElement = el.querySelector(".downvotes-count");
          const currentCount = parseInt(countElement.textContent);
          countElement.textContent = currentCount - 1;
          el.className = "downvotes";
        } else {
          const upvotesCountElement = el.parentElement.querySelector(".upvotes-count");
          const upvotesCount = parseInt(upvotesCountElement.textContent);
          upvotesCountElement.textContent = upvotesCount - 1;
          const upvotes = el.parentElement.querySelector(".triangle-up").parentElement;
          upvotes.className = "upvotes";
          const countElement = el.querySelector(".downvotes-count");
          const currentCount = parseInt(countElement.textContent);
          countElement.textContent = currentCount + 1;
          el.className = "downvotes-voted";
        }
        console.log(result);
      } else {
        console.log(result);
      }
    } else {
      console.log(response);
    }
  } catch (error) {
      console.error("Error: ", error);
  }
}

async function deletePost(data, event) {
  event.stopPropagation();
  const accessToken = localStorage.getItem("accessToken");
  const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + accessToken,
      }
  };

  try {
    const response = await fetch(`${config.apiUrl}/posts/delete?postId=${data.postId}`, options)
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        const currentUserPage = localStorage.getItem("currentUserPage");
        await loadUserPosts(parseInt(currentUserPage));
        console.log(result);
      } else {
        console.log(result);
      }
    } else {
      console.log(response);
    }
  } catch (error) {
      console.error("Error: ", error);
  }
}

function cancel(postDetails, postContainer, approvalButtonsContainer, event) {
  event.stopPropagation();
  postContainer.removeChild(approvalButtonsContainer);
  postDetails.style.display = "flex";
}
