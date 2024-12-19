import config from "./config.js";

let menu;
let loggedIn = false;


document.addEventListener("DOMContentLoaded", async function () {
    try {
        loggedIn = await validateUser();
    } catch (e) {
        loggedIn = false;
    }
    loadMenu();
});


window.userState = {
    isLoggedIn: false
};


async function validateUser() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        return false;
    }

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + accessToken,
        },
    };

    try {
        const response = await fetch(`${config.apiUrl}/users/validateUser`, options);
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                console.log(result);
                window.userState.isLoggedIn = true;
                return true;
            } else {
                console.log(result);
                window.userState.isLoggedIn = false;
                return false;
            }
        } else {
            console.log(response);
            window.userState.isLoggedIn = false;
            return false;
        }
    } catch (error) {
        console.error("Response status: " + response.status + "Failed to fetch data from the server:" + error.message);
        window.userState.isLoggedIn = false;
        return false;
    }
}


async function loadMenu() {
    if (loggedIn) {
        const userButton = document.querySelector("#toggle-button");
        userButton.style.display = "block";
        menu = document.querySelector(".user.menu");
        await getProfilePicForMenu()
    } else {
        menu = document.querySelector(".anonymous.menu");
    }
}


document.querySelector("#toggle-button").addEventListener("click", function () {
    if (menu.style.display === "flex") {
        menu.style.display = "none";
    } else {
        menu.style.display = "flex";
    }
});


document.querySelector("#logout-link").addEventListener("click", logout);


async function logout() {
    localStorage.removeItem("accessToken");

    window.userState.isLoggedIn = false;

    await validateUser();

    window.location.href = "/";
}

window.addEventListener("profilePicUploaded", async function (e) {
    await getProfilePicForMenu();
});

async function getProfilePicForMenu() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        console.log("No access token.");
        return;
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
            if (contentType && contentType.includes("application/json")) {
                const result = await response.json();
                console.log(result);
            } else {
                const blob = await response.blob();
                const profilePicMenu = document.querySelector("#profile-pic-menu");
                profilePicMenu.src = URL.createObjectURL(blob);
                profilePicMenu.style.border = "1px solid #000000";
            }
        } else {
            console.log(response);
        }
    } catch (error) {
        console.error("Failed to fetch data from the server:", error.message);
    }
}
