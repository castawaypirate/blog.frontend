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
  var title = document.querySelector("#post-title").value.trim();
  var body = document.querySelector("#post-body").value.trim();
  var link = document.querySelector("#post-button");

  if (title !== "" && body !== "") {
      link.classList.remove("disabled");
      link.classList.add("enabled");
  } else {
      link.classList.remove("enabled");
      link.classList.add("disabled");
  }
}


// attach event listeners to textareas
document.querySelector("#post-title").addEventListener("input", toggleLinkState);
document.querySelector("#post-body").addEventListener("input", toggleLinkState);


document.querySelector("#post-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const title = document.querySelector("#post-title").value;
    const body = document.querySelector("#post-body").value;

    const data = {
        title: title,
        body: body
    };
    create(data);
});
  
async function create(data) {
    let accessToken = localStorage.getItem("accessToken");
    const options = {
        method: "POST",
        headers: {
        "Content-Type": "application/json", // set the content type to JSON
        "Authorization": "Bearer " + accessToken,
        },
        body: JSON.stringify(data), // convert the data to JSON format
    };

    try {
        const response = await fetch(`${config.apiUrl}/posts/create`, options);
        console.log(response);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            let form = document.querySelector("#post-form");
            form.submit();
          } else {
            console.log(response);
          }
        } else {
          console.log(response);
        }
    } catch (error) {
        throw new Error("Error: " + error);
    }
}