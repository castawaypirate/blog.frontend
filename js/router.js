// create document click that watches the nav links only !!!!! hmmmmmmmmm
document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) {
        return;
    }
    // leave new-tab clicks, href-less anchors (e.g. log out) and other sites to the browser
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
        return;
    }
    if (!link.hasAttribute("href") || link.origin !== window.location.origin) {
        return;
    }
    e.preventDefault();
    urlRoute(e, link.href);
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
const urlRoute = (event, href) => {
    event = event || window.event; // get window.event if event argument not provided
    event.preventDefault();
    // window.history.pushState(state, unused, target link);
    window.history.pushState({}, "", href || event.target.closest("a").href);
    urlLocationHandler();
};

// one cache key per page load: CSS is downloaded once per visit, and a refresh still picks up edits
const BOOT = Date.now();
// route style path -> { link, ready }, so a page seen before switches without a new request
const routeStyles = new Map();
// template path -> promise of its html
const templates = new Map();
// bumped on every navigation, so a slow earlier one can't overwrite a later one
let navId = 0;

// load a route stylesheet and resolve once it can be applied
function ensureStyle(style) {
    if (!style) {
        return Promise.resolve();
    }
    if (!routeStyles.has(style)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `${style}?v=${BOOT}`;
        // downloaded now but not applied, so it can't restyle the page still on screen
        link.media = "not all";
        // a missing file must not hang the page, so errors resolve too
        const ready = new Promise(resolve => {
            link.onload = resolve;
            link.onerror = resolve;
        });
        document.head.appendChild(link);
        routeStyles.set(style, { link, ready });
    }
    return routeStyles.get(style).ready;
}

// apply the route stylesheet and switch the others off (index.css is not managed here)
function applyRouteStyle(style) {
    routeStyles.forEach((entry, key) => {
        entry.link.media = key === style ? "all" : "not all";
    });
}

function getTemplate(path) {
    if (!templates.has(path)) {
        const html = fetch(path).then(response => response.text());
        // a failed fetch is retried on the next visit
        html.catch(() => templates.delete(path));
        templates.set(path, html);
    }
    return templates.get(path);
}

// switch pages without a full reload
export function navigate(path) {
    window.history.pushState({}, "", path);
    urlLocationHandler();
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

    const thisNav = ++navId;

    // fetch the template, the stylesheet and the page module together; the current page
    // stays on screen until all three are ready, then the new one replaces it in one step
    const [html, , module] = await Promise.all([
        getTemplate(route.template),
        ensureStyle(route.style),
        route.module ? import(route.module) : null
    ]);

    if (thisNav !== navId) {
        return;
    }

    applyRouteStyle(route.style);
    document.querySelector("#content").innerHTML = html;

    // set title
    document.title = route.title;

    // update header link if the route defines it
    if (route.headerText) {
        const headerLink = document.querySelector("#header");
        headerLink.href = route.headerHref || "/";
        headerLink.textContent = route.headerText;
    }

    // initialize the page module
    if (module && typeof module.init === "function") {
        module.init();
    }
};

export async function load404Template() {
    const route = urlRoutes["404"];
    const thisNav = navId;
    const [html] = await Promise.all([getTemplate(route.template), ensureStyle(route.style)]);
    // the user already moved on to another page
    if (thisNav !== navId) {
        return;
    }
    applyRouteStyle(route.style);
    document.querySelector("#content").innerHTML = html;
    document.title = route.title;
}

// add an event listener to the window that watches for url changes
window.onpopstate = urlLocationHandler;
// call the urlLocationHandler function to handle the initial url
window.route = urlRoute;
// call the urlLocationHandler function to handle the initial url
urlLocationHandler();
