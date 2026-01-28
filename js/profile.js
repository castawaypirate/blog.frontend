import config from "./config.js";

window.addEventListener("loadProfile", function (e) {
    setTimeout(function () {
    }, 100);
    getUserData();
    getProfilePic();
});


async function getUserData() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        console.log("No access token.");
    }

    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + accessToken,
        },
    };

    try {
        const response = await fetch(`${config.apiUrl}/users/getUserData`, options);
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                console.log(result);
                document.querySelector("#username").textContent = result.user.username;

                if (result.user.has_sent_messages) {
                    document.querySelector("#messages-link").style.display = "block";
                    document.querySelector("#messages-divider").style.display = "block";
                }
            } else {
                console.log(result);
            }
        } else {
            console.log(response);
        }
    } catch (error) {
        console.error("Response status: " + response.status + "Failed to fetch data from the server:" + error.message);
    }
}


async function getProfilePic() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        console.log("No access token.");
    }

    const options = {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + accessToken,
        },
    };

    try {
        const response = await fetch(`${config.apiUrl}/users/getProfilePic`, options);
        const contentType = response.headers.get("Content-Type");
        if (response.ok) {
            const profilePic = document.querySelector("#profile-pic");
            if (contentType && contentType.includes("application/json")) {
                const result = await response.json();
                console.log(result);
                profilePic.src = "/assets/user-profile-pic.png";
            } else {
                const blob = await response.blob();
                profilePic.src = URL.createObjectURL(blob);
                profilePic.style.border = "1px solid #000000";
            }
        } else {
            console.log(response);
        }
    } catch (error) {
        console.error("Failed to fetch data from the server:", error.message);
    }
}


document.querySelector("#upload-input").addEventListener("change", uploadProfilePic);

async function uploadProfilePic(event) {
    try {
        const file = event.target.files[0];

        const formData = new FormData();
        formData.append("profilePic", file);

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            console.log("No access token.");
            return;
        }

        // content type should be FORM_DATA
        const response = await fetch(`${config.apiUrl}/users/uploadProfilePic`, {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": "Bearer " + accessToken
            }
        });

        const data = await response.json();

        if (data.success) {
            console.log(data);
            await getProfilePic();
            fire();
        } else {
            console.error("Error uploading profile picture:", data.message);
        }
    } catch (error) {
        console.error("Error uploading profile picture:", error.message);
    }
}

let uploadProfilePicEvent = new CustomEvent("profilePicUploaded", {
    detail: {
        message: "A new profile picture has been uploaded."
    }
});

function fire() {
    setTimeout(() => {
        window.dispatchEvent(uploadProfilePicEvent);
    }, 10);
}


const modal = document.querySelector("#modal");
const modalTitle = modal.querySelector("h2");
const modalInput1 = modal.querySelector("#modal-input-1");
const modalInput2 = modal.querySelector("#modal-input-2");
const modalButton = modal.querySelector("button");

window.addEventListener("click", function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

document.querySelector("#change-username").addEventListener("click", showChangeUsernameModal);

document.querySelector("#change-password").addEventListener("click", showChangePasswordModal);

modalInput1.addEventListener("input", toggleButtonState);
modalInput2.addEventListener("input", toggleButtonState);

function toggleButtonState() {
    const isPasswordChange = modalInput2.style.display !== "none";
    const isValid = modalInput1.value.trim() !== "" &&
        (!isPasswordChange || modalInput2.value.trim() !== "");

    if (isValid) {
        modalButton.classList.remove("modal-disabled");
        modalButton.classList.add("modal-enabled");
    } else {
        modalButton.classList.remove("modal-enabled");
        modalButton.classList.add("modal-disabled");
    }
}

function showChangeUsernameModal(event) {
    event.preventDefault();
    modalTitle.textContent = "change username";
    modalInput1.type = "text";
    modalInput1.placeholder = "new username";
    modalInput1.value = "";
    modalInput2.style.display = "none";
    toggleButtonState();
    modalButton.removeEventListener("click", changePassword);
    modalButton.addEventListener("click", changeUsername);
    modal.style.display = "block";
}

function showChangePasswordModal(event) {
    event.preventDefault();
    modalTitle.textContent = "change password";
    modalInput1.type = "password";
    modalInput1.placeholder = "current password";
    modalInput1.value = "";
    modalInput2.placeholder = "new password";
    modalInput2.value = "";
    modalInput2.style.display = "block";
    toggleButtonState();
    modalButton.removeEventListener("click", changeUsername);
    modalButton.addEventListener("click", changePassword);
    modal.style.display = "block";
}

async function changeUsername() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        console.log("No access token.");
        return;
    }
    const data = {
        username: document.querySelector("#modal-input-1").value
    };

    const options = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + accessToken,
        },
        body: JSON.stringify(data),
    };

    try {
        const response = await fetch(`${config.apiUrl}/users/changeUsername`, options);

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                console.log(result);
                await getUserData();
            } else {
                console.log(result);
            }
        } else {
            console.log(response);
        }
    } catch (error) {
        throw new Error("Error: " + error);
    }

    modal.style.display = "none";
}

async function changePassword() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        console.log("No access token.");
        return;
    }
    const data = {
        oldPassword: document.querySelector("#modal-input-1").value,
        newPassword: document.querySelector("#modal-input-2").value
    };

    const options = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + accessToken,
        },
        body: JSON.stringify(data),
    };

    try {
        const response = await fetch(`${config.apiUrl}/users/changePassword`, options);

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
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

    modal.style.display = "none";
}


document.querySelector("#delete-profile-pic").addEventListener("click", function () {
    const menuContainer = document.querySelector("#profile-menu-container");
    const profileMenu = document.querySelector("#profile-menu");
    profileMenu.style.display = "none";

    const approvalButtonsContainer = document.createElement("nav");
    approvalButtonsContainer.className = "options";

    const sure = document.createElement("div");
    sure.textContent = "sure";

    const nah = document.createElement("div");
    nah.textContent = "nah";

    const divider = document.createElement("div");
    divider.textContent = "|";
    divider.className = "divider";

    approvalButtonsContainer.appendChild(sure);
    approvalButtonsContainer.appendChild(divider);
    approvalButtonsContainer.appendChild(nah);
    menuContainer.appendChild(approvalButtonsContainer);


    sure.addEventListener("click", async function (event) {
        await deleteProfilePic(event, menuContainer, approvalButtonsContainer, profileMenu);
    });
    nah.addEventListener("click", function (event) {
        event.stopPropagation();
        menuContainer.removeChild(approvalButtonsContainer);
        profileMenu.style.display = "flex";
    });
});

async function deleteProfilePic(event, menuContainer, approvalButtonsContainer, profileMenu) {
    event.stopPropagation();
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        console.log("No access token.");
        return;
    }
    const options = {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + accessToken,
        }
    };

    try {
        const response = await fetch(`${config.apiUrl}/users/deleteProfilePic`, options)
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                console.log(result);
                await getProfilePic();
            } else {
                console.log(result);
            }
        } else {
            console.log(response);
        }
    } catch (error) {
        console.error("Error: ", error);
    }

    // restore the profile menu
    menuContainer.removeChild(approvalButtonsContainer);
    profileMenu.style.display = "flex";
}

document.querySelector("#delete-account").addEventListener("click", function () {
    const menuContainer = document.querySelector("#profile-menu-container");
    const profileMenu = document.querySelector("#profile-menu");
    profileMenu.style.display = "none";

    const approvalButtonsContainer = document.createElement("nav");
    approvalButtonsContainer.className = "options";

    const killIt = document.createElement("div");
    killIt.textContent = "kill it in about two hours and one minute";

    const spareIt = document.createElement("div");
    spareIt.textContent = "spare it";

    const divider = document.createElement("div");
    divider.textContent = "|";
    divider.className = "divider";

    approvalButtonsContainer.appendChild(killIt);
    approvalButtonsContainer.appendChild(divider);
    approvalButtonsContainer.appendChild(spareIt);
    menuContainer.appendChild(approvalButtonsContainer);


    killIt.addEventListener("click", async function (event) {
        await deleteAccount(event, menuContainer, approvalButtonsContainer, profileMenu);
    });
    spareIt.addEventListener("click", function (event) {
        event.stopPropagation();
        menuContainer.removeChild(approvalButtonsContainer);
        profileMenu.style.display = "flex";
    });
});

async function deleteAccount(event, menuContainer, approvalButtonsContainer, profileMenu) {
    event.stopPropagation();
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        console.log("No access token.");
        return;
    }
    const options = {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + accessToken,
        }
    };

    try {
        const response = await fetch(`${config.apiUrl}/users/delete`, options)
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                console.log(result);
                console.log("If you want to save your account, you need to log in within about two hours...");
                // restore the profile menu
                menuContainer.removeChild(approvalButtonsContainer);
                profileMenu.style.display = "flex";
                await logout();
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

document.querySelector("#logout").addEventListener("click", logout);

async function logout() {
    localStorage.removeItem("accessToken");

    window.userState.isLoggedIn = false;

    window.location.href = "/";
}
