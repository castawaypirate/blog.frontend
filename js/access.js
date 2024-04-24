import config from "./config.js";

document.querySelector("#access-form").addEventListener("submit", function(event) {
  event.preventDefault();

  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;

  const data = {
      username: username,
      password: password
  };
  access(data);
});

function access(data) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  fetch(`${config.apiUrl}/users/access`, options)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      return response.json();
    })
    .then(result => {
      if (result.success) {
        localStorage.setItem("accessToken", result.token);
        // window.location.replace("/");
        let form = document.querySelector("#access-form");
        form.submit(); //redirects to dashboard
      } else {
        console.log(result);
      }
    })
    .catch(error => {
      console.error("Error:", error);
    });
}