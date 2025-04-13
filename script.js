// DOM Elements
const intro = document.getElementById("intro");
const startBtn = document.getElementById("startBtn");
const privacyCheck = document.getElementById("privacyCheck");
const status = document.getElementById("status");
const chatbox = document.getElementById("chatbox");
const messages = document.getElementById("messages");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const disconnected = document.getElementById("disconnected");
const exitBtn = document.getElementById("exitBtn");


let socket;

// Enable start button only when checkbox is ticked
privacyCheck.addEventListener("change", () => {
    if (privacyCheck.checked) {
        startBtn.disabled = false;
        startBtn.classList.add("enabled");
    } else {
        startBtn.disabled = true;
        startBtn.classList.remove("enabled");
    }
});

// Start Chat
startBtn.addEventListener("click", () => {
    intro.classList.add("hidden");
    status.classList.remove("hidden");

    socket = io("https://park-server-522c.onrender.com"); // Replace with deployed URL later

    socket.on("connect", () => {
        status.textContent = "Waiting for someone in the park...";
    });

    socket.on("waiting", () => {
        status.textContent = "Waiting for someone in the park...";
    });

    socket.on("chat-start", () => {
        status.classList.add("hidden");
        chatbox.classList.remove("hidden");
        disconnected.classList.add("hidden");

        messages.innerHTML = ""; // ✅ Clear previous chat
        appendMessage("🟢 You are now connected to a random person.");
    });


    socket.on("message", (msg) => {
        appendMessage("Stranger: " + msg, false); // Receiver's message
    });

    socket.on("partner-disconnected", () => {
        appendMessage("🔴 Your partner disconnected.", false);
        disconnected.classList.remove("hidden");
        chatbox.classList.add("hidden");
        status.textContent = "Waiting for a new person...";
        status.classList.remove("hidden");
    });
});

// Send message
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;
    appendMessage("You: " + msg, true); // Sender's message
    socket.emit("message", msg);
    input.value = "";
}

function appendMessage(msg, isSender) {
    const div = document.createElement("div");
    div.textContent = msg;

    // Add a class to differentiate between sender and receiver
    if (isSender) {
        div.classList.add("sender");
    } else {
        div.classList.add("receiver");
    }

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}
exitBtn.addEventListener("click", () => {
    if (socket) {
        socket.emit("leave-chat"); // Notify server
        socket.disconnect(); // Close connection
    }

    // Reset UI
    chatbox.classList.add("hidden");
    status.textContent = "You have left the chat.";
    status.classList.remove("hidden");
    disconnected.classList.add("hidden");
    messages.innerHTML = "";
    intro.classList.remove("hidden");
    privacyCheck.checked = false;
    startBtn.disabled = true;
    startBtn.classList.remove("enabled");
});
