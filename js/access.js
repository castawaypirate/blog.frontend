import config from './config.js';
import Auth from './auth.js';

document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const data = {
        username: username,
        password: password
    };
    access(data);
  });


function access(data) {
    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON
        },
        body: JSON.stringify(data), // Convert the data to JSON format
      };


    fetch(`${config.apiUrl}/users/access`, options)
      .then(response => response.json())
      .then(result => {
        if(result.success){
          localStorage.setItem('accessToken', result.token);

          // const currentPath = window.location.pathname;
          // const baseURL = window.location.origin;
          // const newPath = currentPath.substring(0, currentPath.lastIndexOf("/")) + "/posts.html";
          // window.location.href = baseURL + newPath;
          window.location.replace("/posts")

          const form = document.getElementById('form');
          form.submit();
        }
      })
      .catch(error => console.log('error', error));

}