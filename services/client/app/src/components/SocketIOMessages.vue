<template>
    <div class="socket-io-messages-container">
        <h2>Socket IO Messages</h2>

        <div class="server-status" :class="{ connected: isConnected }">
            Server status: {{ isConnected ? "Connected" : "Disconnected" }}
        </div>

        <div v-if="myUserId" class="username">
            Connected as: <i>“{{ myUserId }}”</i>
        </div>

        <div class="messages-box">
            <div
                v-for="(message, index) in messages"
                :key="index"
                :class="[
                    'message-container',
                    {
                        'my-message': isSentByMe(message),
                        'system-message': isSystemMessage(message),
                        'other-message':
                            !isSentByMe(message) && !isSystemMessage(message),
                    },
                ]"
            >
                <div class="message">{{ message.value }}</div>
            </div>
        </div>

        <div class="input-area">
            <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                placeholder="Write a new message..."
                class="message-input"
                :disabled="!isConnected"
            />
            <button
                @click="sendMessage"
                class="send-button"
                :disabled="!isConnected"
            >
                Send
            </button>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { io } from "socket.io-client";

export default {
    name: "SocketIOMessages",
    setup() {
        const messages = ref([]);
        const newMessage = ref("");
        const socket = ref(null);
        const isConnected = ref(false);
        const systemId = ref("system");
        const myUserId = ref("");
        const serverUrl = ref("localhost:3000");

        const isSentByMe = (message) => {
            if (!myUserId.value) return false;
            return myUserId.value === message.userId;
        };

        const isSystemMessage = (message) => {
            return systemId.value === message.userId;
        };

        const connectToServer = () => {
            if (socket.value) {
                // Disconnect if already connected
                socket.value.disconnect();
                isConnected.value = false;
                myUserId.value = null;
            }

            try {
                socket.value = io(serverUrl.value);

                socket.value.on("connect", () => {
                    console.log("Connected to server");
                    isConnected.value = true;
                    messages.value.push({
                        userId: systemId.value,
                        value: "Connected to server",
                    });
                });

                socket.value.on("connect_error", (error) => {
                    // console.error("Connection failed:", error);
                    isConnected.value = false;
                    myUserId.value = null;
                    // messages.value.push({
                    //     userId: systemId.value,
                    //     value: "Cannot connect to server",
                    // });
                });

                socket.value.on("welcome", (data) => {
                    myUserId.value = data.userName;
                    messages.value.push({
                        userId: data.userId,
                        value: data.message,
                    });
                });

                socket.value.on("serverMessage", (data) => {
                    let message = `${data.userId}: ${data.message}`;
                    if (myUserId.value === data.userId) message = data.message;

                    return messages.value.push({
                        userId: data.userId,
                        value: message,
                    });
                });

                socket.value.on("userJoined", (data) => {
                    messages.value.push({
                        userId: data.userId,
                        value: `A new user joined (${data.userName})`,
                    });
                });

                socket.value.on("userLeft", (data) => {
                    messages.value.push({
                        userId: data.userId,
                        value: `User disconnected (${data.userName})`,
                    });
                });

                socket.value.on("connectionDenied", (data) => {
                    isConnected.value = false;
                    myUserId.value = null;
                    messages.value.push({
                        userId: systemId.value,
                        value: data.message,
                    });
                });

                socket.value.on("disconnect", (data) => {
                    isConnected.value = false;
                    myUserId.value = null;
                    messages.value.push({
                        userId: systemId.value,
                        value: "Disconnected from server",
                    });
                });
            } catch (error) {
                console.error(`Error: ${error.message}`);
                messages.value.push({
                    userId: systemId.value,
                    value: `Error: ${error.message}`,
                });
            }
        };

        const disconnectFromServer = () => {
            if (socket.value) socket.value.disconnect();
        };

        onMounted(() => {
            connectToServer();
        });

        onUnmounted(() => {
            disconnectFromServer();
        });

        const sendMessage = () => {
            if (!newMessage.value.trim()) return;
            if (!socket.value) return;

            socket.value.emit("clientMessage", {
                message: newMessage.value,
            });
            newMessage.value = "";
        };

        return {
            connectToServer,
            isConnected,
            isSentByMe,
            isSystemMessage,
            messages,
            myUserId,
            newMessage,
            sendMessage,
            serverUrl,
        };
    },
};
</script>

<style scoped>
.socket-io-messages-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    box-shadow: 0 0, 125rem 0.5rem rgba(0, 0, 0, 0.1);
    background-color: #eee;
}

h2 {
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
}

.server-status {
    text-align: center;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 0.25rem;
    background-color: #ffcccc;
    color: #cc0000;
    font-weight: bold;
}

.server-status.connected {
    background-color: #ccffcc;
    color: #006600;
}

.username {
    text-align: center;
    margin-bottom: 1rem;
    border-radius: 0.25rem;
}

.messages-box {
    height: 300px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
    background-color: #f9f9f9;
}

.message-container {
    display: flex;
    margin: 0.5rem 0;
    width: 100%;
}

/* Messages sent from current user - aligned on the right */
.my-message {
    justify-content: flex-end;
}

/* Messages sent from other users - aligned on the left */
.other-message {
    justify-content: flex-start;
}

/* System messages - centered */
.system-message {
    justify-content: center;
}

.message {
    margin: 0.5rem 0;
    padding: 0.5rem 0.75rem;
    background-color: #e7f2fa;
    border-radius: 10.5rem;
    display: inline-block;
    max-width: 80%;
    word-break: break-word;
}

.my-message .message {
    background-color: #dcf8c6;
    color: #000;
    border-bottom-right-radius: 0.25rem;
    text-align: right;
}

.other-message .message {
    background-color: #e7f2fa;
    color: #000;
    border-bottom-left-radius: 0.25rem;
    text-align: left;
}

.system-message .message {
    background-color: #e6e6e6;
    color: #666;
    border-radius: 0.75rem;
    font-style: italic;
    font-size: 0.9em;
    max-width: 90%;
    text-align: center;
}

.input-area {
    display: flex;
    gap: 1rem;
}

.message-input {
    flex: 1;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    font-size: 0.875rem;
}

.message-input:focus {
    border-color: #4caf50;
    box-shadow: 0 0 0 0.125rem rgba(76, 175, 80, 0.2);
}

.send-button {
    padding: 1rem 2rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-weight: bold;
}

.send-button:hover:not(:disabled) {
    background-color: #45a049;
}

.send-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}
</style>