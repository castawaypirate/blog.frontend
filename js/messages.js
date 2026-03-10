
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
    const messagesContainer = document.querySelector('.container');
    const usersList = document.getElementById('users-list');
    const userSearch = document.getElementById('user-search');

    const mockUsers = [
        { id: 1, username: 'test1', profilePic: '/assets/user-profile-pic.png' },
        { id: 2, username: 'test2', profilePic: '/assets/user-profile-pic.png' },
        { id: 3, username: 'test3', profilePic: '/assets/user-profile-pic.png' },
        { id: 4, username: 'alice', profilePic: '/assets/user-profile-pic.png' },
        { id: 5, username: 'bobboboboobobobobobobobobobobobobobobobobooboflgks;dflgj;sdfkg;sdfg;sdfgj;sdflkg;sdfj;gsd;fgkbobobobobobobobobobobobbobobobobobobobobobobobobobobobobdfal;sdkf;lasdjf;akjsd;faks;dfja;sdo', profilePic: '/assets/user-profile-pic.png' },
    ];


    const mockMessages = {
        1: [
            { sender: 'them', content: 'Hey, how are you?' },
            { sender: 'me', content: 'I am good, thanks! And you?;aksdf;aksd;fka;sdkf;asd;fkj;askdjf;kas;dfkj;alsdjf;lkas;dlfkj;aslkdjf;laksjd;flkajs;dlkfj;asldkjf;laskjdf;lkasjd;flkja;sdkjf;aksdfj;asdf;kas;dfka;sdfj;asdlkf;asdkjf;askfd' },
            { sender: 'them', content: 'Pretty good as well.;fjsa;dfljk;asldkfj;askdf;askdf;laksd;flka;sdlkfj;askdf;lkasjd;flkjas;dlkfj;aksdjf;laksdj;flkjas;dlkfj;alskdjf;kasd;lkfj;aslkdjf;laksjd;fkajs;dkfj;alskd;fka;sdf;asd;flk' }
        ],
        2: [
            { sender: 'me', content: 'Did you see the new post?;flaskjdf;lajs;dflkja;sdlfj;alsjkdf;ajs;dfkj;asldkf;askdf;kasjdf;kasj;dflkj;aslkdf;laskdf;lkasjdf;lkajs;dfkj;asdkdf;askd;flkas;dfkj;asdkfj;askdf;' }
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

        function submitMessage() {
            const content = messageInput.value.trim();
            if (content !== "") {
                console.log("Sending message: ", content);

                // Clear the input area
                messageInput.value = '';
                messageInput.style.height = "auto";
                sendButton.classList.remove("enabled");
                sendButton.classList.add("disabled");
            }
        }

        messageInput.addEventListener('keydown', function (e) {
            // Check if Enter is pressed without Shift
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent default new line
                submitMessage();
            }
        });

        // Ensure clicking the send button also works
        sendButton.onclick = function () {
            submitMessage();
        };

        const header = document.createElement('div');
        header.className = 'conversation-header';

        const backButton = document.createElement('button');
        backButton.className = 'back-button';
        backButton.innerHTML = '&lt;'; // < symbol
        backButton.addEventListener('click', () => {
            messagesContainer.classList.remove('chat-active');
        });

        header.appendChild(backButton);

        const usernameDisplay = document.createElement('h3');
        usernameDisplay.textContent = user.username;
        header.appendChild(usernameDisplay);

        messagesDisplayArea.appendChild(header);

        // Switch to chat view on mobile
        messagesContainer.classList.add('chat-active');

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
