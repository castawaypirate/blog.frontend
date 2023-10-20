import Auth from './auth.js';

// create document click that watches the nav links only
document.addEventListener("click", (e) => {
	const { target } = e;
	if (!target.matches("nav a")) {
		return;
	}
	e.preventDefault();
	urlRoute();
});

const urlRoutesOut = {
	"/": {
		template: "/"
	}
};

const urlRoutesIn = {
	"/posts": {
		template: "/posts.html"
	}
};

const urlRouteNotFound = {
	404: {
		template: "/404.html"
	}
};

// create a function that watches the url and calls the urlLocationHandler
const urlRoute = (event) => {
	event = event || window.event; // get window.event if event argument not provided
	event.preventDefault();
	// window.history.pushState(state, unused, target link);
	window.history.pushState({}, "", event.target.href);
	urlLocationHandler();
};

// create a function that handles the url location
const urlLocationHandler = async () => {
	let location = window.location.pathname; // get the url path
	// if the path length is 0, set it to primary page route
	if (location.length === 0) {
		location = "/";
	}
	let out = true;

	// get the route object from the urlRoutesIn or urlRouteOut object depending on if the user is logged in
	try {
		const authInstance = new Auth();
        const user = await authInstance.validateUser();
		console.log(user);
		if (user) {
			out = false;
		} else {
			out = true;
		}
	} catch (error) {
		out = true;
		console.log(error.message);
	}
	if (urlRoutesIn.hasOwnProperty(location)===false && urlRoutesOut.hasOwnProperty(location)===false) {
		if (location !== "/404") {
			console.log(location);
			const currentPath = window.location.pathname;
			const baseURL = window.location.origin;
			const newPath = currentPath.substring(0, currentPath.lastIndexOf("/")) + "/404.html";
			window.location.href = baseURL + newPath;
		}
	}
	else {
		if (out) {
			if (urlRoutesIn.hasOwnProperty(location)) {
				const currentPath = window.location.pathname;
				const baseURL = window.location.origin;
				const newPath = currentPath.substring(0, currentPath.lastIndexOf("/")) + "/";
				window.location.href = baseURL + newPath;
			}
		}
		else {
			if (urlRoutesOut.hasOwnProperty(location)) {
				const currentPath = window.location.pathname;
				const baseURL = window.location.origin;
				const newPath = currentPath.substring(0, currentPath.lastIndexOf("/")) + "/posts.html";
				window.location.href = baseURL + newPath;
			}
		}
	}	
};

// add an event listener to the window that watches for url changes
window.onpopstate = urlLocationHandler;
// call the urlLocationHandler function to handle the initial url
window.route = urlRoute;
// call the urlLocationHandler function to handle the initial url
urlLocationHandler();