
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

    const mockUsers = [
        { id: 1, username: 'test1', profilePic: '/assets/user-profile-pic.png' },
        { id: 2, username: 'test2', profilePic: '/assets/user-profile-pic.png' },
        { id: 3, username: 'test3', profilePic: '/assets/user-profile-pic.png' },
        { id: 4, username: 'alice', profilePic: '/assets/user-profile-pic.png' },
        { id: 5, username: 'bob', profilePic: '/assets/user-profile-pic.png' },
    ];


    const mockMessages = {
        1: [
            { sender: 'them', content: 'Hey, how are you?' },
            { sender: 'me', content: 'I am good, thanks! And you?' },
            { sender: 'them', content: 'Pretty good as well.' }
        ],
        2: [
            { sender: 'me', content: 'Did you see the new post?' }
        ],
        4: [
            { sender: 'them', content: 'Hello Alice here.' },
            { sender: 'me', content: 'Hi Alice!' }
        ]
    };

    function renderUsers(users) {
        usersList.innerHTML = '';
        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <img src="${user.profilePic}" alt="${user.username}" class="user-item-pic">
                <div class="user-item-username">${user.username}</div>
            `;

            userItem.addEventListener('click', () => {
                console.log(`Clicked on user: ${user.username}`);
                renderConversation(user);
            });

            usersList.appendChild(userItem);
        });
    }

    function renderConversation(user) {
        const conversationPanel = document.getElementById('conversation-panel');
        const messagesDisplayArea = document.getElementById('messages-display-area');
        const chatInputArea = document.getElementById('chat-input-area');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');

        messagesDisplayArea.innerHTML = '';

        chatInputArea.style.display = 'flex';

        sendButton.classList.add('disabled');
        sendButton.classList.remove('enabled');
        messageInput.value = '';

        messageInput.oninput = function () {
            if (this.value.trim() !== "") {
                sendButton.classList.remove("disabled");
                sendButton.classList.add("enabled");
            } else {
                sendButton.classList.remove("enabled");
                sendButton.classList.add("disabled");
            }
            this.style.height = "auto";
            this.style.height = (this.scrollHeight) + "px";
        };

        const header = document.createElement('div');
        header.className = 'conversation-header';
        header.innerHTML = `<h3>${user.username}</h3>`;
        messagesDisplayArea.appendChild(header);

        const messages = mockMessages[user.id] || [];

        if (messages.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'message-placeholder';
            emptyMsg.textContent = 'No messages yet.';
            messagesDisplayArea.appendChild(emptyMsg);
            return;
        }

        const messagesList = document.createElement('div');
        messagesList.className = 'messages-list';

        messages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.textContent = msg.content;
            msgDiv.classList.add('message-text');

            if (msg.sender === 'me') {
                msgDiv.classList.add('message-me');
            } else {
                msgDiv.classList.add('message-them');
            }
            messagesList.appendChild(msgDiv);
        });

        messagesDisplayArea.appendChild(messagesList);
    }

    renderUsers(mockUsers);

    userSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filteredUsers = mockUsers.filter(user =>
            user.username.toLowerCase().includes(query)
        );
        renderUsers(filteredUsers);
    });
}
