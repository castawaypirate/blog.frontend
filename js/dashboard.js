import config from "./config.js";

window.addEventListener("initializeDashboard", function (e) {
    setTimeout(function () {
    }, 100);
    const storedPage = localStorage.getItem("currentPage");
    if (storedPage) {
        loadPosts(storedPage);
    } else {
        loadPosts(1);
    }
});

function goToPreviousPage() {
    const currentUserPage = localStorage.getItem("currentUserPage");
    loadPosts(parseInt(currentUserPage) - 1);
}

function goToNextPage() {
    const currentUserPage = localStorage.getItem("currentUserPage");
    loadPosts(parseInt(currentUserPage) + 1);
}


async function loadPosts(pageNumber) {
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
        } else {
            const desc= document.querySelector(".description");
            desc.style.display = "none";
        }

        const response = await fetch(`${config.apiUrl}/posts/getDashboardPosts?pageNumber=${pageNumber}`, options);
        if (response.ok) {
            const result = await response.json();
            console.log(result);
            if (result.success && result.posts) {
                const formatDate = (date) => {
                    return new Intl.DateTimeFormat("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }).format(date);
                };

                const postsContainer = document.querySelector("#posts-container");
                // clean dashboard from previous posts
                postsContainer.innerHTML = "";

                const table = document.createElement("table");
                table.className = "dashboard-table";
                const tbody = document.createElement("tbody");

                // keep counting
                const startNumber = (result.pageNumber - 1) * config.postsPerPage + 1;

                result.posts.forEach((post, index) => {
                    const tr = document.createElement("tr");
                    const numberCell = document.createElement("td");
                    const number = document.createElement("h3");
                    number.className = "number";
                    number.textContent = (startNumber + index) + ". ";
                    numberCell.appendChild(number);
                    const postCell = document.createElement("td");

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
                    if (window.userState.isLoggedIn && userVotes) {
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
                    } else {
                        upvotes.className = "upvotes-disabled";
                    }

                    const triangleUp = document.createElement("div");
                    triangleUp.className = "triangle-up";
                    const countUp = document.createElement("div");
                    countUp.className = "upvotes-count";
                    countUp.textContent = post.upvotes;
                    upvotes.appendChild(triangleUp);
                    upvotes.appendChild(countUp);

                    const downvotes = document.createElement("div");
                    if (window.userState.isLoggedIn && userVotes) {
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
                    } else {
                        downvotes.className = "downvotes-disabled";
                    }

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

                    postCell.appendChild(postContainer);
                    tr.appendChild(numberCell);
                    tr.appendChild(postCell);
                    tbody.appendChild(tr);
                });

                table.appendChild(tbody);
                postsContainer.appendChild(table);

                let totalPages = result.totalPages;
                let currentUserPage = result.pageNumber;
                localStorage.setItem("currentUserPage", currentUserPage);

                if (totalPages > 1) {
                    const paginationRow = document.createElement("tr");
                    const emptyPaginationCell = document.createElement("td");
                    const paginationCell = document.createElement("td");

                    const paginationDiv = document.createElement("div");
                    paginationDiv.id = "pagination";
                    paginationDiv.className = "pagination";

                    // function to create and append a button
                    const createButton = (id, text, clickHandler) => {
                        const button = document.createElement("div");
                        button.id = id;
                        button.textContent = text;
                        button.addEventListener("click", (event) => {
                            event.preventDefault();
                            clickHandler();
                        });
                        return button;
                    };

                    // determine which buttons to show
                    const buttons = [];
                    if (currentUserPage > 1) {
                        buttons.push(createButton("previous", "previous", goToPreviousPage));
                    }
                    if (currentUserPage < totalPages) {
                        if (buttons.length > 0) {
                            const divider = document.createElement("div");
                            divider.id = "pagination-divider";
                            divider.className = "divider";
                            divider.textContent = "|";
                            buttons.push(divider);
                        }
                        buttons.push(createButton("next", "next", goToNextPage));
                    }

                    // append buttons to paginationDiv
                    buttons.forEach(button => paginationDiv.appendChild(button));

                    paginationCell.appendChild(paginationDiv);
                    paginationRow.appendChild(emptyPaginationCell);
                    paginationRow.appendChild(paginationCell);
                    tbody.appendChild(paginationRow);

                    table.appendChild(tbody);
                    postsContainer.appendChild(table);
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
