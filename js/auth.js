import config from './config.js';

export default class Auth {
    constructor() {}

    async validateUser() {
        let accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            throw new Error("Access token not found.");
        }
        try {
            const result = await this.sendToken(accessToken);
            if (result.success) {
                return result;
            } else {
                console.log(response);
            }
        } catch (error) {
            throw new Error("Response status: " + response.status +
                "Token validation failed due to an error:" + error.message);
        }
    }

    async sendToken(token) {
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
            },
        };

        try {
            const response = await fetch(`${config.apiUrl}/users/validateUser`, options);
            if (response.ok) {
                const result = await response.json();
                return result;
            } else {
                console.log(response);
            }
        } catch (error) {
            throw new Error("Response status: " + response.status +
                "Failed to fetch data from the server:" + error.message);
        }
    }
}
