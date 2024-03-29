import config from "./config.js";

async function loadPosts() {
    // console.log("HA");
}

if (document.readyState !== 'loading') {
    const user = loadPosts();
} else {
    document.addEventListener('DOMContentLoaded', loadPosts);
}
  
