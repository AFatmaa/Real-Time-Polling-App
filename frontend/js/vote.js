import { ws, onPollUpdate, onGeneralMessage, sendMessage, showMessage } from './shared.js';

// Generate a unique user ID if not already stored in localStorage
let userId = localStorage.getItem("userId");
if (!userId) {
    userId = "user-" + Math.random().toString(36).slice(2, 11);
    localStorage.setItem("userId", userId);
}

let hasVoted = false;

// Local copy of the current poll data, updated via WebSocket
let currentPollData = null;

// Register a callback to handle poll data updates from the server
onPollUpdate((poll) => {
    currentPollData = poll;
    renderPoll(currentPollData);
});

// Register a callback to handle general messages (like vote success/error, admin resets)
onGeneralMessage((data) => {
    if (data.type === "vote-success") {
        showMessage("Vote recorded! Thank you!", "success");
        hasVoted = true;
        disableVoting();
    } else if (data.type === "error") {
        showMessage(data.message, "error");
        if (data.message.includes("already voted")) {
            hasVoted = true;
            disableVoting();
        }
    } else if (data.type === "client-reset-vote-status") {
        // Allow voting again after admin reset
        hasVoted = false;
        if (currentPollData) renderPoll(currentPollData); // Re-render to re-enable buttons
        showMessage("Admin reset votes. You can vote again!", "info");
    }
});

// Handle disconnection
ws.onclose = () => {
    console.log("Disconnected from server (Voting Page)");
    showMessage("Connection lost. Please refresh the page.", "error");
};

// Display poll question and options
function renderPoll(poll) {
    // Update the poll question
    document.getElementById("question").textContent = poll.question;

    // Clear previous options and render new ones
    const container = document.getElementById("options-container");
    container.innerHTML = "";

    poll.options.forEach((option) => {
        const button = document.createElement("button");
        button.className = "option-btn";
        button.textContent = option.text;
        button.onclick = () => vote(option.id); // Attach vote handler to each button

        // Disable button if user has already voted
        if (hasVoted) {
            button.disabled = true;
        }

        container.appendChild(button);
    });

    // Display a message if the user has already voted
    if (hasVoted) {
        showMessage("You already voted!", "info");
    }
}

/**
 * Sends a vote to the server for the selected option.
 * @param {number} optionId - The ID of the option the user voted for.
 */
function vote(optionId) {
    if (hasVoted) {
        showMessage("You already voted!", "error");
        return;
    }

    // Send the vote message via WebSocket
    sendMessage({
        type: "vote",
        optionId: optionId,
        userId: userId, // Include user ID to prevent duplicate votes
    });
}

// Disables all voting option buttons on the page.
function disableVoting() {
    const buttons = document.querySelectorAll(".option-btn");
    buttons.forEach((btn) => (btn.disabled = true));
}