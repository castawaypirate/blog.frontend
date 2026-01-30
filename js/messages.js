
let initializeMessagesEvent = new CustomEvent("initializeMessages", {
    detail: {
        message: "Messages page initialized."
    }
});

window.addEventListener("initializeMessages", function (e) {
    console.log("Messages page initialized via router event.");
    initializeMockMessages();
});

function initializeMockMessages() {
    const usersList = document.getElementById('users-list');
    const userSearch = document.getElementById('user-search');

    // Mock Data
    const mockUsers = [
        { id: 1, username: 'test1', profilePic: '/assets/user-profile-pic.png' },
        { id: 2, username: 'test2', profilePic: '/assets/user-profile-pic.png' },
        { id: 3, username: 'test3', profilePic: '/assets/user-profile-pic.png' },
        { id: 4, username: 'alice', profilePic: '/assets/user-profile-pic.png' },
        { id: 5, username: 'bob', profilePic: '/assets/user-profile-pic.png' },
    ];

    function renderUsers(users) {
        usersList.innerHTML = ''; // Clear list
        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';

            // Mock profile picture logic (using default if path is same as template default)
            // In a real app we might fallback to default if image load fails

            userItem.innerHTML = `
                <img src="${user.profilePic}" alt="${user.username}" class="user-item-pic">
                <div class="user-item-username">${user.username}</div>
            `;

            // Add click event for navigation (mock)
            userItem.addEventListener('click', () => {
                console.log(`Clicked on user: ${user.username}`);
                // Future: Navigate to conversation
                // window.history.pushState({}, "", `/messages/${user.id}`);
                // urlLocationHandler();
            });

            usersList.appendChild(userItem);
        });
    }

    // Initial render
    renderUsers(mockUsers);

    // Search functionality
    userSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filteredUsers = mockUsers.filter(user =>
            user.username.toLowerCase().includes(query)
        );
        renderUsers(filteredUsers);
    });
}
