document.addEventListener("DOMContentLoaded", function () {
    const textarea = document.getElementById('postTitle');

    textarea.addEventListener('keydown', function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
        }
    });
});