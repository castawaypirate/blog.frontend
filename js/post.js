import config from "./config.js";
import {load404Template} from './router.js';

window.addEventListener("loadPost", function (e) {
    const postId = window.location.pathname.split("/").pop();
    loadPost(postId);
    loadComments(postId);
});

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

async function loadPost(postId) {
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    };

    try {
        let userVotes;
        if (window.userState.isLoggedIn) {
            try {
                userVotes = await getUserVotes();
            } catch (error) {
                console.error("Error getting user votes:", error);
            }
        }

        const response = await fetch(`${config.apiUrl}/posts/getPost?postId=${postId}`, options);
        if (response.ok) {
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

                // load post votes
                const upvotes = document.createElement("div");
                if (window.userState.isLoggedIn && userVotes) {
                    if (userVotes.upvotes.includes(post.id)) {
                        upvotes.className = "post-upvotes-voted";
                    } else {
                        upvotes.className = "post-upvotes";
                    }
                    upvotes.addEventListener("click", function () {
                        const data = {
                            postId: post.id
                        };
                        upvotePost(this, data);
                    });
                } else {
                    upvotes.className = "post-upvotes-disabled";
                }

                const triangleUp = document.createElement("div");
                triangleUp.className = "post-votes-triangle-up";
                const countUp = document.createElement("div");
                countUp.className = "post-upvotes-count";
                countUp.textContent = post.upvotes;
                upvotes.appendChild(triangleUp);
                upvotes.appendChild(countUp);

                const downvotes = document.createElement("div");
                if (window.userState.isLoggedIn && userVotes) {
                    if (userVotes.downvotes.includes(post.id)) {
                        downvotes.className = "post-downvotes-voted";
                    } else {
                        downvotes.className = "post-downvotes";
                    }
                    downvotes.addEventListener("click", function () {
                        const data = {
                            postId: post.id
                        };
                        downvotePost(this, data);
                    });
                } else {
                    downvotes.className = "post-downvotes-disabled";
                }

                const triangleDown = document.createElement("div");
                triangleDown.className = "post-votes-triangle-down";
                const countDown = document.createElement("div");
                countDown.className = "post-downvotes-count";
                countDown.textContent = post.downvotes;
                downvotes.appendChild(triangleDown);
                downvotes.appendChild(countDown);

                const divider = document.createElement("div");
                divider.className = "post-votes-divider";
                divider.textContent = "|";

                const votes = document.createElement("div");
                votes.className = "post-votes";
                votes.appendChild(upvotes);
                votes.appendChild(divider.cloneNode(true));
                votes.appendChild(downvotes);
                postContainer.appendChild(votes);
            } else {
                console.error("Post not found.");
                try {
                    await load404Template();
                    console.log("404 template loaded due to error.");
                } catch (error) {
                    console.error("Failed to load 404 template:", error);
                }
            }
        } else {
            console.log(response);
        }
    } catch (error) {
        console.error("Error loading post:", error);
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
                    const countElement = el.querySelector(".post-upvotes-count");
                    const currentCount = parseInt(countElement.textContent);
                    countElement.textContent = currentCount + 1;
                    el.className = "post-upvotes-voted";
                } else if (result.action === "unvote") {
                    const countElement = el.querySelector(".post-upvotes-count");
                    const currentCount = parseInt(countElement.textContent);
                    countElement.textContent = currentCount - 1;
                    el.className = "post-upvotes";
                } else {
                    const downvotesCountElement = el.parentElement.querySelector(".post-downvotes-count");
                    const downvotesCount = parseInt(downvotesCountElement.textContent);
                    downvotesCountElement.textContent = downvotesCount - 1;
                    const downvotes = el.parentElement.querySelector(".post-votes-triangle-down").parentElement;
                    downvotes.className = "post-downvotes";
                    const countElement = el.querySelector(".post-upvotes-count");
                    const currentCount = parseInt(countElement.textContent);
                    countElement.textContent = currentCount + 1;
                    el.className = "post-upvotes-voted";
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
                    const countElement = el.querySelector(".post-downvotes-count");
                    const currentCount = parseInt(countElement.textContent);
                    countElement.textContent = currentCount + 1;
                    el.className = "post-downvotes-voted";
                } else if (result.action === "unvote") {
                    const countElement = el.querySelector(".post-downvotes-count");
                    const currentCount = parseInt(countElement.textContent);
                    countElement.textContent = currentCount - 1;
                    el.className = "post-downvotes";
                } else {
                    const upvotesCountElement = el.parentElement.querySelector(".post-upvotes-count");
                    const upvotesCount = parseInt(upvotesCountElement.textContent);
                    upvotesCountElement.textContent = upvotesCount - 1;
                    const upvotes = el.parentElement.querySelector(".post-votes-triangle-up").parentElement;
                    upvotes.className = "post-upvotes";
                    const countElement = el.querySelector(".post-downvotes-count");
                    const currentCount = parseInt(countElement.textContent);
                    countElement.textContent = currentCount + 1;
                    el.className = "post-downvotes-voted";
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


async function getUserCommentsVotes() {
    const accessToken = localStorage.getItem("accessToken");
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + accessToken,
        }
    };
    try {
        const response = await fetch(`${config.apiUrl}/comments/getUserVotes`, options);
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


async function getUserComments() {
    const accessToken = localStorage.getItem("accessToken");
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + accessToken,
        }
    };
    try {
        const postId = window.location.pathname.split("/").pop();
        const response = await fetch(`${config.apiUrl}/comments/getUserComments?postId=${postId}`, options);
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


async function comment(data) {
    let accessToken = localStorage.getItem("accessToken");
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + accessToken,
        },
        body: JSON.stringify(data),
    };

    try {
        const response = await fetch(`${config.apiUrl}/comments/create`, options);
        if (response.ok) {
            const result = await response.json();
            if (result.success) {

                console.log("Comment was created.")
                loadComments(data.postId);
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

function toggleButtonState(textareaId, buttonId) {
    const body = document.querySelector(textareaId).value.trim();
    const button = document.querySelector(buttonId);

    if (body !== "") {
        button.classList.remove("disabled");
        button.classList.add("enabled");
    } else {
        button.classList.remove("enabled");
        button.classList.add("disabled");
    }
}


async function loadComments(postId) {
    try {
        let userCommentsVotes;
        let userComments;
        let commentForm;
        if (window.userState.isLoggedIn) {
            try {
                commentForm = document.createElement("form");
                commentForm.id = "comment-form";

                const commentBody = document.createElement("textarea");
                commentBody.id = "comment-body";
                commentBody.placeholder = "type your comment here...";
                commentBody.rows = 1;
                commentBody.required = true;

                const commentButton = document.createElement("button");
                commentButton.textContent = "comment";
                commentButton.id = "comment-button";
                commentButton.type = "submit";
                commentButton.className = "disabled";

                commentBody.addEventListener("input", function () {
                    this.style.height = "auto";
                    this.style.height = (this.scrollHeight) + "px";
                });
                commentBody.addEventListener("input", function () {
                    toggleButtonState("#comment-body", "#comment-button");
                });

                commentForm.appendChild(commentBody);
                commentForm.appendChild(commentButton);

                commentForm.addEventListener("submit", function (event) {
                    event.preventDefault();

                    const data = {
                        postId: postId,
                        body: commentBody.value
                    };

                    comment(data);

                    commentBody.value = "";
                    commentButton.classList.remove("enabled");
                    commentButton.classList.add("disabled");

                });

                userCommentsVotes = await getUserCommentsVotes();
                userComments = await getUserComments();
            } catch (error) {
                console.error("Error getting user comments votes:", error);
            }
        }

        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        };

        const response = await fetch(`${config.apiUrl}/comments/getPostComments?postId=${postId}`, options);
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                const formatDate = (date) => {
                    const options = {day: "numeric", month: "short", year: "numeric"};
                    const day = date.toLocaleString("en-US", {day: "numeric"});
                    const month = date.toLocaleString("en-US", {month: "short"});
                    const year = date.toLocaleString("en-US", {year: "numeric"});
                    return `${day} ${month} ${year}`;
                };

                const commentsContainer = document.querySelector(".comments-container");
                // Because the way the router is built, when you go back and load a route again, it will dispatch an event. Many JS scripts will have been loaded,
                // and they will all be triggered when the event is dispatched, so the function loadComments is executed multiple times.
                // We need to clear the comments container after each request, so no matter how many requests are made, it will clean its contents every time until the last one.
                commentsContainer.innerHTML = "";

                const commentsHeader = document.createElement("h3");
                commentsHeader.textContent = "comments.";
                commentsContainer.appendChild(commentsHeader);

                if (window.userState.isLoggedIn) {
                    commentsContainer.appendChild(commentForm)
                }

                result.comments.forEach(comment => {
                    const commentContainer = document.createElement("div");
                    commentContainer.className = "comment-container";
                    commentContainer.setAttribute("data-comment-id", comment.id);

                    const commentBody = document.createElement("div");
                    commentBody.className = "comment-body";

                    const formattedBody = comment.body.replace(/\n/g, "<br>");
                    commentContainer.innerHTML = `
            <div class="comment-body">${formattedBody}</div>`;

                    const commentDetails = document.createElement("div");
                    commentDetails.className = "comment-details";

                    const commentUpvotes = document.createElement("div");
                    if (window.userState.isLoggedIn && userCommentsVotes) {
                        if (userCommentsVotes.upvotes.includes(comment.id)) {
                            commentUpvotes.className = "comment-upvotes-voted";
                        } else {
                            commentUpvotes.className = "comment-upvotes";
                        }
                        commentUpvotes.addEventListener("click", function () {
                            const postId = window.location.pathname.split("/").pop();
                            const data = {
                                postId: Number(postId),
                                commentId: comment.id
                            };
                            upvoteComment(this, data);
                        });
                    } else {
                        commentUpvotes.className = "comment-upvotes-disabled";
                    }

                    const triangleUp = document.createElement("div");
                    triangleUp.className = "comment-votes-triangle-up";
                    const countUp = document.createElement("div");
                    countUp.className = "comment-upvotes-count";
                    countUp.textContent = comment.upvotes;
                    commentUpvotes.appendChild(triangleUp);
                    commentUpvotes.appendChild(countUp);

                    const commentDownvotes = document.createElement("div");
                    if (window.userState.isLoggedIn && userCommentsVotes) {
                        if (userCommentsVotes.downvotes.includes(comment.id)) {
                            commentDownvotes.className = "comment-downvotes-voted";
                        } else {
                            commentDownvotes.className = "comment-downvotes";
                        }
                        commentDownvotes.addEventListener("click", function () {
                            const postId = window.location.pathname.split("/").pop();
                            const data = {
                                postId: Number(postId),
                                commentId: comment.id
                            };
                            downvoteComment(this, data);
                        });
                    } else {
                        commentDownvotes.className = "comment-downvotes-disabled";
                    }

                    const triangleDown = document.createElement("div");
                    triangleDown.className = "comment-votes-triangle-down";
                    const countDown = document.createElement("div");
                    countDown.className = "comment-downvotes-count";
                    countDown.textContent = comment.downvotes;
                    commentDownvotes.appendChild(triangleDown);
                    commentDownvotes.appendChild(countDown);

                    const created = document.createElement("div");
                    created.className = "created";
                    created.textContent = formatDate(new Date(comment.created_at));

                    const edited = document.createElement("div");
                    edited.className = "edited";
                    edited.textContent = formatDate(new Date(comment.updated_at));

                    const commentCreator = document.createElement("div");
                    commentCreator.className = "comment-creator";
                    commentCreator.textContent = comment.username;

                    const divider = document.createElement("div");
                    divider.className = "comment-details-divider";
                    divider.textContent = "|";

                    commentDetails.appendChild(commentUpvotes);
                    commentDetails.appendChild(divider.cloneNode(true));
                    commentDetails.appendChild(commentDownvotes);
                    commentDetails.appendChild(divider.cloneNode(true));
                    commentDetails.appendChild(created);
                    commentDetails.appendChild(divider.cloneNode(true));
                    commentDetails.appendChild(edited);
                    commentDetails.appendChild(divider.cloneNode(true));
                    commentDetails.appendChild(commentCreator);

                    if (window.userState.isLoggedIn) {
                        if (userComments.includes(comment.id)) {
                            const editCommentButton = document.createElement("div");
                            editCommentButton.className = "comment-edit";
                            editCommentButton.textContent = "edit";

                            editCommentButton.addEventListener('click', function () {
                                // replace div with textarea
                                const commentBodyDiv = commentContainer.querySelector(".comment-body");
                                const edittedCommentBody = document.createElement("textarea");
                                edittedCommentBody.className = "comment-edit-textarea";
                                edittedCommentBody.id = "editted-comment-body";
                                edittedCommentBody.rows = 1;
                                edittedCommentBody.required = true;

                                commentBodyDiv.addEventListener("input", function () {
                                    this.style.height = "auto";
                                    this.style.height = (this.scrollHeight) + "px";
                                });

                                // convert <br> tags to line breaks and count the number of lines
                                const commentText = commentBodyDiv.innerHTML.replace(/<br\s*\/?>/gi, "\n");
                                const lineCount = (commentText.match(/\n/g) || []).length + 1;
                                // set the number of rows based on the line count
                                edittedCommentBody.rows = lineCount;
                                edittedCommentBody.value = commentText;

                                commentContainer.replaceChild(edittedCommentBody, commentBodyDiv);
                                edittedCommentBody.focus();

                                // hide comment details and show update and cancel buttons
                                commentDetails.style.display = "none";

                                const commentEditButtonsContainer = document.createElement("div");
                                commentEditButtonsContainer.className = "comment-details";

                                const updateButton = document.createElement("div");
                                updateButton.id = "update-button";
                                updateButton.textContent = "update";

                                updateButton.addEventListener("click", function (event) {
                                    updateComment(edittedCommentBody, comment.id, commentContainer, commentDetails, commentBodyDiv, commentEditButtonsContainer, event);
                                });

                                edittedCommentBody.addEventListener("input", function () {
                                    toggleButtonState("#editted-comment-body", "#update-button");
                                });

                                commentEditButtonsContainer.appendChild(updateButton);

                                commentEditButtonsContainer.appendChild(divider.cloneNode(true));

                                const cancelButton = document.createElement("div");
                                cancelButton.id = "cancel-button";
                                cancelButton.textContent = "cancel";

                                cancelButton.addEventListener("click", function (event) {
                                    cancel(commentDetails, commentContainer, commentEditButtonsContainer, edittedCommentBody, commentBodyDiv, event);
                                });
                                commentEditButtonsContainer.appendChild(cancelButton);

                                commentContainer.appendChild(commentEditButtonsContainer);
                            });

                            const deleteCommentButton = document.createElement("div");
                            deleteCommentButton.addEventListener("click", function () {
                                const data = {
                                    commentId: comment.id
                                };

                                commentDetails.style.display = "none";

                                const approvalButtonsContainer = document.createElement("div");
                                approvalButtonsContainer.className = "comment-details";

                                const sure = document.createElement("div");
                                sure.className = "sure-button";
                                sure.textContent = "sure";

                                const nah = document.createElement("div");
                                nah.className = "nah-button";
                                nah.textContent = "nah";

                                approvalButtonsContainer.appendChild(sure);
                                approvalButtonsContainer.appendChild(divider.cloneNode(true));
                                approvalButtonsContainer.appendChild(nah);
                                commentContainer.appendChild(approvalButtonsContainer);

                                sure.addEventListener("click", async function (event) {
                                    await deleteComment(data, event);
                                });
                                nah.addEventListener("click", function (event) {
                                    cancelDeletion(commentDetails, commentContainer, approvalButtonsContainer, event);
                                });
                            });

                            deleteCommentButton.className = "comment-delete";
                            deleteCommentButton.textContent = "delete";

                            commentDetails.appendChild(divider.cloneNode(true));
                            commentDetails.appendChild(editCommentButton);
                            commentDetails.appendChild(divider.cloneNode(true));
                            commentDetails.appendChild(deleteCommentButton);

                        }
                    }
                    commentContainer.appendChild(commentDetails);
                    commentsContainer.appendChild(commentContainer);
                });


            } else {
                console.log(result);
            }
        } else {
            console.log(response);
        }
    } catch (error) {
        console.error("Error loading comments:", error);
    }
}


async function upvoteComment(el, data) {
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
        const response = await fetch(`${config.apiUrl}/comments/upvote`, options);
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                if (result.action === "upvote") {
                    const countElement = el.querySelector(".comment-upvotes-count");
                    const currentCount = parseInt(countElement.textContent);
                    countElement.textContent = currentCount + 1;
                    el.className = "comment-upvotes-voted";
                } else if (result.action === "unvote") {
                    const countElement = el.querySelector(".comment-upvotes-count");
                    const currentCount = parseInt(countElement.textContent);
                    countElement.textContent = currentCount - 1;
                    el.className = "comment-upvotes";
                } else {
                    const downvotesCountElement = el.parentElement.querySelector(".comment-downvotes-count");
                    const downvotesCount = parseInt(downvotesCountElement.textContent);
                    downvotesCountElement.textContent = downvotesCount - 1;
                    const downvotes = el.parentElement.querySelector(".comment-votes-triangle-down").parentElement;
                    downvotes.className = "comment-downvotes";
                    const countElement = el.querySelector(".comment-upvotes-count");
                    const currentCount = parseInt(countElement.textContent);
                    countElement.textContent = currentCount + 1;
                    el.className = "comment-upvotes-voted";
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


async function downvoteComment(el, data) {
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
        const response = await fetch(`${config.apiUrl}/comments/downvote`, options);
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                if (result.action === "downvote") {
                    const countElement = el.querySelector(".comment-downvotes-count");
                    const currentCount = parseInt(countElement.textContent);
                    countElement.textContent = currentCount + 1;
                    el.className = "comment-downvotes-voted";
                } else if (result.action === "unvote") {
                    const countElement = el.querySelector(".comment-downvotes-count");
                    const currentCount = parseInt(countElement.textContent);
                    countElement.textContent = currentCount - 1;
                    el.className = "comment-downvotes";
                } else {
                    const upvotesCountElement = el.parentElement.querySelector(".comment-upvotes-count");
                    const upvotesCount = parseInt(upvotesCountElement.textContent);
                    upvotesCountElement.textContent = upvotesCount - 1;
                    const upvotes = el.parentElement.querySelector(".comment-votes-triangle-up").parentElement;
                    upvotes.className = "comment-upvotes";
                    const countElement = el.querySelector(".comment-downvotes-count");
                    const currentCount = parseInt(countElement.textContent);
                    countElement.textContent = currentCount + 1;
                    el.className = "comment-downvotes-voted";
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

function cancel(commentDetails, commentContainer, commentEditButtonsContainer, edittedCommentBody, commentBodyDiv, event) {
    event.stopPropagation();
    commentContainer.removeChild(commentEditButtonsContainer);
    commentDetails.style.display = "flex";

    commentContainer.replaceChild(commentBodyDiv, edittedCommentBody);
}

async function updateComment(edittedCommentBody, commentId, commentContainer, commentDetails, commentBodyDiv, commentEditButtonsContainer, event) {
    event.stopPropagation();
    const postId = window.location.pathname.split("/").pop();
    const data = {
        postId: Number(postId),
        body: edittedCommentBody.value
    }

    let accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        console.log("No access token.");
        return;
    }

    const options = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + accessToken,
        },
        body: JSON.stringify(data),
    };

    try {
        const response = await fetch(`${config.apiUrl}/comments/edit?commentId=${commentId}`, options);
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                commentContainer.removeChild(commentEditButtonsContainer);
                commentDetails.style.display = "flex";

                // replace newline characters with <br> now for the comments as well
                const updatedCommentText = edittedCommentBody.value.replace(/\n/g, "<br>");
                commentBodyDiv.innerHTML = updatedCommentText;

                commentContainer.replaceChild(commentBodyDiv, edittedCommentBody);
                console.log(result);
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

async function deleteComment(data, event) {
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
        const response = await fetch(`${config.apiUrl}/comments/delete?commentId=${data.commentId}`, options)
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                const postId = window.location.pathname.split("/").pop();
                await loadComments(postId);
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

function cancelDeletion(commentDetails, commentContainer, approvalButtonsContainer, event) {
    event.stopPropagation();
    commentContainer.removeChild(approvalButtonsContainer);
    commentDetails.style.display = "flex";
}
