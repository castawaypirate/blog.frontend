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
        style: "/css/404.css"
    },
    "/": {
        template: "/templates/dashboard.html",
        title: "dashboard.",
        module: "/js/dashboard.js",
        style: "/css/dashboard.css",
        headerText: "dashboard.",
        headerHref: "/"
    },
    "/access": {
        template: "/templates/access.html",
        title: "access.",
        module: "/js/access.js",
        style: "/css/access.css"
    },
    "/create": {
        template: "/templates/create.html",
        title: "create.",
        module: "/js/create.js",
        style: "/css/create.css"
    },
    "/posts": {
        template: "/templates/posts.html",
        title: "posts.",
        module: "/js/posts.js",
        style: "/css/posts.css",
        headerText: "posts.",
        headerHref: "/posts"
    },
    "/post/:id": {
        template: "/templates/post.html",
        title: "post.",
        module: "/js/post.js",
        style: "/css/post.css"
    },
    "/edit/:id": {
        template: "/templates/edit.html",
        title: "edit.",
        module: "/js/edit.js",
        style: "/css/edit.css"
    },
    "/profile": {
        template: "/templates/profile.html",
        title: "profile.",
        module: "/js/profile.js",
        style: "/css/profile.css"
    },
    "/messages": {
        template: "/templates/messages.html",
        title: "messages.",
        module: "/js/messages.js",
        style: "/css/messages.css",
        headerText: "messages.",
        headerHref: "/messages"
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
        cssLink.href = `${route.style}?${Date.now()}`;
        head.appendChild(cssLink);
    }
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

    // update header link if the route defines it
    if (route.headerText) {
        const headerLink = document.querySelector("#header");
        headerLink.href = route.headerHref || "/";
        headerLink.textContent = route.headerText;
    }

    // load and initialize page module via dynamic import
    if (route.module) {
        const module = await import(route.module);
        if (typeof module.init === "function") {
            module.init();
        }
    }
};

export async function load404Template() {
    const route = urlRoutes["404"];
    loadRouteStyles(route);
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
