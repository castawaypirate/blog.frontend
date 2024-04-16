// create document click that watches the nav links only
document.addEventListener("click", (e) => {
	const { target } = e;
	if (!target.matches("nav a")) {
		return;
	}
	e.preventDefault();
	urlRoute();
});


// create an object that maps the url to the template, title, and description
const urlRoutes = {
	404: {
		template: "/404.html",
        title: "404.",
        script: "",
        style: "css/404.css"
	},
	"/": {
		template: "/templates/dashboard.html",
        title: "dashboard.",
		script: "js/dashboard.js",
        style: "css/dashboard.css",
		onLoad: initializeDashboard

	},
	"/access": {
		template: "/templates/access.html",
        title: "access.",
		script: "js/access.js",
        style: "css/access.css"
	},
	"/create": {
		template: "/templates/create.html",
        title: "create.",
		script: "js/create.js",
        style: "css/create.css"
	},
};


// create a function that watches the url and calls the urlLocationHandler
const urlRoute = (event) => {
	event = event || window.event; // get window.event if event argument not provided
	event.preventDefault();
	// window.history.pushState(state, unused, target link);
	window.history.pushState({}, "", event.target.href);
	urlLocationHandler();
};


// function to dynamically load CSS and JS files
function loadRouteFiles(route) {
    const head = document.getElementsByTagName("head")[0];

    // remove existing CSS and JS files, excluding index.css, index.js, and router.js
    Array.from(document.getElementsByTagName("link")).forEach(link => {
        if (link.rel === "stylesheet" && !link.href.endsWith("index.css")) {
			head.removeChild(link);
		} 
    });
    Array.from(document.getElementsByTagName("script")).forEach(script => {
        if (script.src && !script.src.endsWith("index.js") && !script.src.endsWith("router.js")) {
			head.removeChild(script);
		}
    });

	// make menus invisible again
	let menus = document.querySelectorAll(".menu");
	menus.forEach(menu =>{
		menu.style.display = "none";
	});

    // load new CSS file, excluding index.css
    if (route.style && !route.style.endsWith("index.css")) {
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = route.style;
        head.appendChild(cssLink);
    }

    // load new JS file, excluding index.js and router.js
	if (route.script && !route.script.endsWith("index.js") && !route.script.endsWith("router.js")) {
		const jsScript = document.createElement("script");
		jsScript.type = "module";
		// append a unique query parameter to the script's URL
        jsScript.src = `${route.script}?${Date.now()}`;
		head.appendChild(jsScript);
	}
}


let customEvent = new CustomEvent("ready", {
  detail: {
     message: "index.js has been fully loaded and executed."
  }
});
 
function initializeDashboard() {
	setTimeout(() => {
		window.dispatchEvent(customEvent);
	}, 200);
}
  


// create a function that handles the url location
const urlLocationHandler = async () => {
	const location = window.location.pathname; // get the url path
	// if the path length is 0, set it to primary page route
	if (location.length === 0) {
		location = "/";
	}

	// get the route object from the urlRoutes object
	const route = urlRoutes[location] || urlRoutes["404"];
	// get the html from the template
	const html = await fetch(route.template).then((response) => response.text());
	// set the content of the content div to the html
	document.querySelector("#content").innerHTML = html;
    // set title
	document.title = route.title;
    // load styles and scripts
	loadRouteFiles(route);

	// execute onLoad assigned function when navigating to route
	if (typeof route.onLoad === 'function') {
		route.onLoad();
	}
};


// add an event listener to the window that watches for url changes
window.onpopstate = urlLocationHandler;
// call the urlLocationHandler function to handle the initial url
window.route = urlRoute;
// call the urlLocationHandler function to handle the initial url
urlLocationHandler();