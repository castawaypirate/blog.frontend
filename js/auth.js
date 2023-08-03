import config from './config.js';

export default class Auth {
    constructor() {

    }

    async validateToken(accessToken) {
        let validation = false; // Declare 'validation' variable

        if (accessToken) {
            try {
                const response = await this.sendToken(accessToken); // Use async/await
                if (response) {
                    // document.querySelector("body").style.display = "block";
                    return true;
                    // validation = true;

                }
            } catch (error) {
                console.log("Request failed:", error);
                return false;
            }
        }

        if (!validation) {
            return false;
            // window.location.replace("/access.html");
        }
    }

    async sendToken(token) { // Use async/await
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
            },
        };

        try {
            const response = await fetch(`${config.apiUrl}/users/validateUser`, options); // Use await here
            const result = await response.json(); // Use await here
            if (result.success) {
                return result;
            } else {
                return false;
            }
        } catch (error) {
            console.log('error', error);
            return false;
        }
    }
}