// Import shared WebSocket functionalities and helpers
import { ws, onPollUpdate, onGeneralMessage, sendMessage, showMessage } from './shared.js';

// Local copy of the current poll data for this page
let currentPollData = null;

// Register a callback to handle poll data updates from the server
onPollUpdate((poll) => {
    currentPollData = poll;
    displayCurrentPoll(currentPollData); // Update the displayed current poll info
});

// Register a callback to handle general messages (e.g., server errors)
onGeneralMessage((data) => {
    if (data.type === "error") {
        showMessage("Server Error: " + data.message, "error");
        // Hide error message after 3 seconds specific to admin page
        setTimeout(() => {
            document.getElementById("message").style.display = "none";
        }, 3000);
    }
    // No other specific message types are typically handled by the admin page
});

// Custom handling for WebSocket disconnection on this page
ws.onclose = () => {
    console.log("Disconnected from server (Admin Page)");
    showMessage("Connection lost. Please refresh the page.", "error");
};

/**
 * Displays the current poll's question and options (with vote counts) in the admin panel.
 * @param {Object} poll - The poll object containing question and options.
 */
function displayCurrentPoll(poll) {
    document.getElementById("current-question").textContent = poll.question;

    const optionsList = document.getElementById("current-options");
    optionsList.innerHTML = ""; // Clear previous options

    poll.options.forEach((option) => {
        const li = document.createElement("li");
        li.textContent = `${option.text} (${option.votes} votes)`;
        optionsList.appendChild(li);
    });
}

/**
 * Handles the submission of the "Create New Poll" form.
 * Sends a 'create-poll' message to the server via WebSocket.
 * @param {Event} event - The form submission event.
 */
function createPoll(event) {
    event.preventDefault(); // Prevent default form submission and page reload

    const question = document.getElementById("question").value.trim();
    const optionsText = document.getElementById("options").value.trim();

    // Split options by newline, trim whitespace, and filter out empty lines
    const options = optionsText
        .split("\n")
        .map((opt) => opt.trim())
        .filter((opt) => opt.length > 0);

    // Validate that at least 2 options are provided
    if (options.length < 2) {
        showMessage("Please enter at least 2 options!", "error");
        // Hide error message after 3 seconds
        setTimeout(() => {
            document.getElementById("message").style.display = "none";
        }, 3000);
        return;
    }

    // Send the 'create-poll' message to the server
    sendMessage({
        type: "create-poll",
        question: question,
        options: options,
    });

    // Clear the form after submission
    document.getElementById("poll-form").reset();
    showMessage("Poll created successfully!", "success");
    // Hide success message after 3 seconds
    setTimeout(() => {
        document.getElementById("message").style.display = "none";
    }, 3000);
}

/**
 * Prompts the user for confirmation and then sends a 'reset-votes' message to the server.
 */
function resetVotes() {
    if (confirm("Are you sure you want to reset all votes? This action cannot be undone.")) {
        sendMessage({
            type: "reset-votes",
        });
        showMessage("Votes reset successfully!", "success");
        // Hide success message after 3 seconds
        setTimeout(() => {
            document.getElementById("message").style.display = "none";
        }, 3000);
    }
}

// Make functions globally accessible so they can be called from HTML `onclick` or `onsubmit` attributes
window.createPoll = createPoll;
window.resetVotes = resetVotes;