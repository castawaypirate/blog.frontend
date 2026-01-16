// create document click that watches the nav links only !!!!! hmmmmmmmmm
document.addEventListener("click", (e) => {
    const { target } = e;
    if (!target.matches("a")) {
        return;
    }
    e.preventDefault();
    urlRoute();
});

// create an object that maps the url to the template, title, and description
const urlRoutes = {
    404: {
        template: "/templates/404.html",
        title: "404.",
        script: "",
        style: "/css/404.css"
    },
    "/": {
        template: "/templates/dashboard.html",
        title: "dashboard.",
        script: "/js/dashboard.js",
        style: "/css/dashboard.css",
        onLoad: initializeDashboard
    },
    "/access": {
        template: "/templates/access.html",
        title: "access.",
        script: "/js/access.js",
        style: "/css/access.css"
    },
    "/create": {
        template: "/templates/create.html",
        title: "create.",
        script: "/js/create.js",
        style: "/css/create.css"
    },
    "/posts": {
        template: "/templates/posts.html",
        title: "posts.",
        script: "/js/posts.js",
        style: "/css/posts.css",
        onLoad: initializeUserPosts
    },
    "/post/:id": {
        template: "/templates/post.html",
        title: "post.",
        script: "/js/post.js",
        style: "/css/post.css",
        onLoad: initializePost
    },
    "/edit/:id": {
        template: "/templates/edit.html",
        title: "edit.",
        script: "/js/edit.js",
        style: "/css/edit.css",
        onLoad: fetchPostToEdit
    },
    "/profile": {
        template: "/templates/profile.html",
        title: "profile.",
        script: "/js/profile.js",
        style: "/css/profile.css",
        onLoad: initializeProfile
    },
    "/messages": {
        template: "/templates/messages.html",
        title: "messages.",
        script: "/js/messages.js",
        style: "/css/messages.css",
        onLoad: initializeMessages
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

function loadRouteStyles(route) {
    const head = document.getElementsByTagName("head")[0];

    // remove existing CSS files, excluding index.css
    Array.from(document.getElementsByTagName("link")).forEach(link => {
        if (link.rel === "stylesheet" && !link.href.endsWith("index.css")) {
            head.removeChild(link);
        }
    });

    // load new CSS file, excluding index.css
    if (route.style && !route.style.endsWith("index.css")) {
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = route.style;
        head.appendChild(cssLink);
    }
}

function loadRouteScripts(route) {
    const head = document.getElementsByTagName("head")[0];

    // remove existing JS files, excluding index.js and router.js
    Array.from(document.getElementsByTagName("script")).forEach(script => {
        if (script.src && !script.src.endsWith("index.js") && !script.src.endsWith("router.js")) {
            head.removeChild(script);
        }
    });

    // load new JS file, excluding index.js and router.js
    if (route.script && !route.script.endsWith("index.js") && !route.script.endsWith("router.js")) {
        const jsScript = document.createElement("script");
        jsScript.type = "module";
        // append a unique query parameter to the script's URL to force reload
        jsScript.src = `${route.script}?${Date.now()}`;
        head.appendChild(jsScript);
    }
}

let initializeDashboardEvent = new CustomEvent("initializeDashboard", {
    detail: {
        message: "index.js has been fully loaded and executed."
    }
});

function initializeDashboard() {
    setTimeout(() => {
        const headerLink = document.querySelector("#header");
        headerLink.href = "/";
        headerLink.textContent = "dashboard.";
        window.dispatchEvent(initializeDashboardEvent);
    }, 200);
}

let initializeUserPostsEvent = new CustomEvent("loadUserPosts", {
    detail: {
        message: "Ready to fetch user posts."
    }
});

function initializeUserPosts() {
    setTimeout(() => {
        const headerLink = document.querySelector("#header");
        headerLink.href = "/posts";
        headerLink.textContent = "posts.";
        window.dispatchEvent(initializeUserPostsEvent);
    }, 200);
}

let initializePostEvent = new CustomEvent("loadPost", {
    detail: {
        message: "Ready to fetch post."
    }
});

function initializePost() {
    setTimeout(() => {
        window.dispatchEvent(initializePostEvent);
    }, 200);
}

let fetchPostToEditEvent = new CustomEvent("fetchPostToEdit", {
    detail: {
        message: "Ready to fetch post to edit."
    }
});

function fetchPostToEdit() {
    setTimeout(() => {
        window.dispatchEvent(fetchPostToEditEvent);
    }, 200);
}

let initializeProfileEvent = new CustomEvent("loadProfile", {
    detail: {
        message: "Ready to fetch user data."
    }
});

function initializeProfile() {
    setTimeout(() => {
        window.dispatchEvent(initializeProfileEvent);
    }, 200);
}

let initializeMessagesEvent = new CustomEvent("initializeMessages", {
    detail: {
        message: "Ready to load messages."
    }
});

function initializeMessages() {
    setTimeout(() => {
        const headerLink = document.querySelector("#header");
        headerLink.href = "/messages";
        headerLink.textContent = "messages.";
        window.dispatchEvent(initializeMessagesEvent);
    }, 200);
}

// create a function that handles the url location
const urlLocationHandler = async () => {
    let location = window.location.pathname; // get the url path
    // if the path length is 0, set it to primary page route
    if (location.length === 0) {
        location = "/";
    }

    let route;

    if (location.startsWith("/post/")) {
        const postMatch = location.match(/\/post\/(\d+)/);
        const postId = postMatch ? postMatch[1] : null;

        if (postId) {
            if (location.split("/").length > 3) {
                route = urlRoutes["404"];
            } else {
                route = urlRoutes["/post/:id"];
            }
        } else {
            route = urlRoutes["404"];
        }
    } else if (location.startsWith("/edit/")) {
        const editMatch = location.match(/\/edit\/(\d+)/);
        const postId = editMatch ? editMatch[1] : null;

        if (postId) {
            if (location.split("/").length > 3) {
                route = urlRoutes["404"];
            } else {
                route = urlRoutes["/edit/:id"];
            }
        } else {
            route = urlRoutes["404"];
        }
    } else {
        route = urlRoutes[location] || urlRoutes["404"];
    }

    let template = route.template;
    let title = route.title;

    // get the html from the template
    const html = await fetch(template).then((response) => response.text());

    const content = document.querySelector("#content");

    // it doesn't make a real difference though to clear the html of the template
    content.style.display = "none";

    // load the styles first
    loadRouteStyles(route)

    // set the content of the content div to the html
    content.innerHTML = html;
    content.style.display = "block";

    // set title
    document.title = title;

    // and then load the scripts
    loadRouteScripts(route);

    // execute onLoad assigned function when navigating to route
    if (typeof route.onLoad === "function") {
        route.onLoad();
    }
};

export async function load404Template() {
    const route = urlRoutes["404"];
    loadRouteStyles(route);
    loadRouteScripts(route);
    setTimeout(() => {
        console.log("This message is displayed after 2 seconds");
    }, 10000);
    const html = await fetch(route.template).then((response) => response.text());
    document.querySelector("#content").innerHTML = html;
    document.title = route.title;
}

// add an event listener to the window that watches for url changes
window.onpopstate = urlLocationHandler;
// call the urlLocationHandler function to handle the initial url
window.route = urlRoute;
// call the urlLocationHandler function to handle the initial url
urlLocationHandler();
