import config from './config.js';

export default class Auth {
    constructor() {
        // this.user = null;
    }

 
    async validateUser() {
        let accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            // console.log("Access token not found.");
            // return;
            throw new Error("Access token not found.");
        }

        try {
            const response = await this.sendToken(accessToken);
            if (response.success) {
                // this.user = response.user;
                return response;
            } else {
                throw new Error("Token validation failed.");
            }
        } catch (error) {
            throw new Error("Token validation failed due to an error:", error.message);
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
            const result = await response.json();

            if (response.ok) {
                return result;
            } else {
                throw new Error("Invalid response from the server.");
            }
        } catch (error) {
            throw new Error("Failed to fetch data from the server:", error.message);
        }
    }

    // async getUser() {
    //     return await this.user;
    // }
}
