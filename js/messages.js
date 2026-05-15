import config from "./config.js";

export function init() {
    initMessages();
}

function initMessages() {
    let currentUserId = null;
    let currentReceiverId = null;
    const messagesContainer = document.querySelector('.container');
    const usersList = document.getElementById('users-list');
    const userSearch = document.getElementById('user-search');

    if (userSearch) {
        userSearch.addEventListener('keydown', async function (e) {
            // Initiate search on Enter (without Shift)
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const query = this.value.trim();
                
                if (query === "") {
                    loadInbox();
                    return;
                }

                usersList.innerHTML = '<div class="message-placeholder">Searching...</div>';
                try {
                    const token = localStorage.getItem('accessToken');
                    const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`, {
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        }
                    });
                    const data = await response.json();
                    
                    if (data.success && data.users) {
                        renderUsers(data.users);
                    } else {
                        usersList.innerHTML = '<div class="message-placeholder">No users found</div>';
                    }
                } catch (error) {
                    console.error('Error searching users:', error);
                    usersList.innerHTML = '<div class="message-placeholder">Error completing search</div>';
                }
            }
        });
    }


    function renderUsers(users) {
        usersList.innerHTML = '';
        if (users.length === 0) {
            usersList.innerHTML = '<div class="message-placeholder">No conversations yet</div>';
            return;
        }

        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            
            // Build the absolute URL to the backend's upload folder
            const baseUrl = config.apiUrl.replace(/\/api\/?$/, '');
            const profilePicSrc = user.profile_pic_path 
                ? `${baseUrl}/uploads/${user.profile_pic_path}` 
                : '/assets/user-profile-pic.png';

            userItem.innerHTML = `
                <img src="${profilePicSrc}" alt="${user.username}" class="user-item-pic">
                <div class="user-item-username">${user.username}</div>
            `;

            userItem.addEventListener('click', () => {
                console.log(`Clicked on user: ${user.username}`);
                renderConversation(user);
            });

            usersList.appendChild(userItem);
        });
    }

    async function renderConversation(user) {
        currentReceiverId = user.user_id || user.id;

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

        async function submitMessage() {
            const content = messageInput.value.trim();
            if (content !== "" && currentReceiverId) {
                // Clear the input area immediately for responsiveness
                messageInput.value = '';
                messageInput.style.height = "auto";
                sendButton.classList.remove("enabled");
                sendButton.classList.add("disabled");

                try {
                    const token = localStorage.getItem('accessToken');
                    const response = await fetch('/api/messages/send', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            receiverId: currentReceiverId,
                            content: content
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        const messagesList = messagesDisplayArea.querySelector('.messages-list') || (() => {
                            const list = document.createElement('div');
                            list.className = 'messages-list';
                            messagesDisplayArea.appendChild(list);
                            const placeholder = messagesDisplayArea.querySelector('.message-placeholder');
                            if (placeholder) placeholder.remove();
                            return list;
                        })();

                        const wrapper = createMessageWrapper(content, currentUserId, true, data.messageId, data.created_at);
                        messagesList.appendChild(wrapper);
                        messagesDisplayArea.scrollTop = messagesDisplayArea.scrollHeight;
                        
                        document.dispatchEvent(new CustomEvent('messageSentSuccessfully'));
                    } else {
                        console.error('Failed to send message:', data.message);
                        alert('Failed to send message: ' + data.message);
                    }
                } catch (err) {
                    console.error('Error sending message:', err);
                    alert('An error occurred while sending the message.');
                }
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
        
        // Show loading state
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'message-placeholder';
        loadingMsg.textContent = 'Loading messages...';
        messagesDisplayArea.appendChild(loadingMsg);

        try {
            const otherUserId = user.user_id || user.id;
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/messages/conversation?otherUserId=${otherUserId}`, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            loadingMsg.remove();

            if (data.success && data.messages) {
                const messages = data.messages;

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
                    const isMine = msg.sender_id == currentUserId;
                    const wrapper = createMessageWrapper(msg.content, currentUserId, isMine, msg.id, msg.created_at);
                    messagesList.appendChild(wrapper);
                });

                messagesDisplayArea.appendChild(messagesList);
                
                // Scroll to bottom of chat
                messagesDisplayArea.scrollTop = messagesDisplayArea.scrollHeight;
            } else {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'message-placeholder';
                errorMsg.textContent = 'Failed to load messages.';
                messagesDisplayArea.appendChild(errorMsg);
            }
        } catch (error) {
            console.error('Error fetching conversation:', error);
            loadingMsg.remove();
            const errorMsg = document.createElement('div');
            errorMsg.className = 'message-placeholder';
            errorMsg.textContent = 'Error connecting to server.';
            messagesDisplayArea.appendChild(errorMsg);
        }
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const day = date.toLocaleString("en-US", { day: "numeric" });
        const month = date.toLocaleString("en-US", { month: "short" });
        const year = date.toLocaleString("en-US", { year: "numeric" });
        return `${day} ${month} ${year}`;
    }

    function createMessageWrapper(content, userId, isMine, messageId = null, createdAt = null) {
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper';

        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message-text');
        msgDiv.classList.add(isMine ? 'message-me' : 'message-them');
        msgDiv.textContent = content;

        wrapper.appendChild(msgDiv);

        const details = document.createElement('div');
        details.className = 'message-details';
        
        // Prevent accidental taps inside the details area from closing the menu
        details.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        const dateSent = document.createElement('div');
        dateSent.className = 'date-sent';
        dateSent.textContent = createdAt ? formatDate(createdAt) : '';
        details.appendChild(dateSent);

        if (isMine) {
            const divider = document.createElement('div');
            divider.className = 'message-details-divider';
            divider.textContent = '|';

            const deleteBtn = document.createElement('div');
            deleteBtn.className = 'message-delete';
            deleteBtn.textContent = 'delete';

            details.appendChild(divider);
            details.appendChild(deleteBtn);

            deleteBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                details.style.display = 'none';

                const approvalContainer = document.createElement('div');
                approvalContainer.className = 'message-approval';
                
                approvalContainer.addEventListener('click', function(ev) {
                    ev.stopPropagation();
                });

                const sureBtn = document.createElement('div');
                sureBtn.className = 'sure-button';
                sureBtn.textContent = 'sure';

                const dividerClone = document.createElement('div');
                dividerClone.className = 'message-details-divider';
                dividerClone.textContent = '|';

                const nahBtn = document.createElement('div');
                nahBtn.className = 'nah-button';
                nahBtn.textContent = 'nah';

                approvalContainer.appendChild(sureBtn);
                approvalContainer.appendChild(dividerClone);
                approvalContainer.appendChild(nahBtn);
                msgDiv.appendChild(approvalContainer);

                sureBtn.addEventListener('click', async function (event) {
                    event.stopPropagation();
                    const token = localStorage.getItem('accessToken');
                    try {
                        const response = await fetch(`/api/messages/delete?messageId=${messageId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': 'Bearer ' + token,
                                'Content-Type': 'application/json'
                            }
                        });
                        const data = await response.json();
                        if (data.success) {
                            wrapper.remove();
                        } else {
                            console.error('Failed to delete message:', data.message);
                            alert('Failed to delete message: ' + data.message);
                            approvalContainer.remove();
                            details.style.display = '';
                        }
                    } catch (err) {
                        console.error('Error deleting message:', err);
                        alert('An error occurred while deleting the message.');
                        approvalContainer.remove();
                        details.style.display = '';
                    }
                });

                nahBtn.addEventListener('click', function (event) {
                    event.stopPropagation();
                    approvalContainer.remove();
                    details.style.display = '';
                });
            });
        }

        msgDiv.appendChild(details);

        // Ensure tap/hover persistence on mobile devices
        msgDiv.addEventListener('click', function (e) {
            e.stopPropagation();
            // Toggle active state to keep metadata options visible
            msgDiv.classList.toggle('active');
        });

        return wrapper;
    }

    async function loadInbox() {
        try {
            const token = localStorage.getItem('accessToken');
            
            // Fetch current user id to determine 'me' vs 'them' in chats
            try {
                const userResponse = await fetch('/api/users/validateUser', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    }
                });
                const userData = await userResponse.json();
                if (userData.success && userData.user) {
                    currentUserId = userData.user.user_id || userData.user.id;
                }
            } catch (e) {
                console.error('Failed to validate user inside messages.js:', e);
            }

            usersList.innerHTML = '<div class="message-placeholder">Loading...</div>';
            const response = await fetch('/api/messages/conversations', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (data.success && data.conversations) {
                renderUsers(data.conversations);
            } else {
                console.error('Failed to load inbox:', data.message);
                usersList.innerHTML = '<div class="message-placeholder">Error loading conversations</div>';
            }
        } catch (error) {
            console.error('Error fetching inbox:', error);
            usersList.innerHTML = '<div class="message-placeholder">Error connecting to server</div>';
        }
    }

    loadInbox();
}
