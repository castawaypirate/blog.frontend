import config from "./config.js";

document.querySelector("#post-title").addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
});

document.querySelector("#post-body").addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
});

function toggleLinkState() {
    const title = document.querySelector("#post-title").value.trim();
    const body = document.querySelector("#post-body").value.trim();
    const link = document.querySelector("#post-button");

    if (title !== "" && body !== "") {
        link.classList.remove("disabled");
        link.classList.add("enabled");
    } else {
        link.classList.remove("enabled");
        link.classList.add("disabled");
    }
}

document.querySelector("#post-title").addEventListener("input", toggleLinkState);
document.querySelector("#post-body").addEventListener("input", toggleLinkState);

document.querySelector("#post-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.querySelector("#post-title").value;
    const body = document.querySelector("#post-body").value;

    if (!title || !body) {
        console.log('Either title or body is empty.');
        return;
    }

    const data = {
        title: title,
        body: body
    };
    await post(data);
});

async function post(data) {
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
        const response = await fetch(`${config.apiUrl}/posts/create`, options);
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                let form = document.querySelector("#post-form");
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
