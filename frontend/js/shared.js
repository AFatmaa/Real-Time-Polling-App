// WebSocket connection to the backend server
const ws = new WebSocket("ws://localhost:3000");

// Stores the current poll data, updated by incoming WebSocket messages
let currentPoll = null;

/**
 * @typedef {Object} PollOption
 * @property {number} id - Unique identifier for the option.
 * @property {string} text - The text of the option.
 * @property {number} votes - The current vote count for this option.
 */

/**
 * @typedef {Object} CurrentPoll
 * @property {string} question - The poll question.
 * @property {PollOption[]} options - An array of poll options.
 */

// Array to store callback functions that should be executed when poll data updates
const pollUpdateListeners = [];
// Array to store callback functions for other general messages (e.g., errors, vote success)
const generalMessageListeners = [];

// Event handler for when the WebSocket connection opens
ws.onopen = () => {
    console.log("Connected to server via WebSocket");
};

// Event handler for when the WebSocket connection closes
ws.onclose = () => {
    console.log("Disconnected from server via WebSocket");
    // Each specific page script (vote.js, admin.js, results.js) can decide how to
    // display a user-facing message upon disconnection.
};

// Event handler for incoming WebSocket messages
ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);

        if (data.type === "poll-data" || data.type === "poll-update") {
            // Update the shared currentPoll data
            currentPoll = data.poll;
            // Notify all registered poll update listeners
            pollUpdateListeners.forEach(listener => listener(currentPoll));
        } else {
            // For other message types (e.g., 'error', 'vote-success', 'client-reset-vote-status')
            // Notify all registered general message listeners
            generalMessageListeners.forEach(listener => listener(data));
        }
    } catch (error) {
        console.error("Error parsing message from server:", error);
    }
};

/**
 * Registers a callback function to be invoked whenever the poll data (question or options/votes) is updated.
 * The callback will also be immediately called if `currentPoll` data is already available.
 * @param {(poll: CurrentPoll) => void} callback - The function to call with the updated poll object.
 */
function onPollUpdate(callback) {
    pollUpdateListeners.push(callback);
    // If poll data is already loaded, call the callback immediately for initial rendering
    if (currentPoll) {
        callback(currentPoll);
    }
}

/**
 * Registers a callback function to be invoked for general messages from the server,
 * excluding 'poll-data' and 'poll-update'. This includes messages like 'error', 'vote-success', etc.
 * @param {(data: Object) => void} callback - The function to call with the received message data.
 */
function onGeneralMessage(callback) {
    generalMessageListeners.push(callback);
}

/**
 * Sends a message object to the server via WebSocket. The object will be JSON stringified.
 * @param {Object} message - The message object to send.
 */
function sendMessage(message) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
        // console.log("Sent message to server:", message.type, message); // For debugging
    } else {
        console.error("WebSocket is not open. Cannot send message:", message);
        showMessage("Connection lost. Please refresh the page.", "error");
    }
}

/**
 * Displays a message on the HTML page within a designated message div.
 * Assumes a div with id="message" exists on the page.
 * @param {string} text - The text content of the message.
 * @param {'success'|'error'|'info'} type - The type of message, used for CSS styling.
 * @param {string} [targetElementId='message'] - The ID of the HTML element where the message should be displayed.
 */
function showMessage(text, type, targetElementId = "message") {
    const messageDiv = document.getElementById(targetElementId);
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = "block"; // Make message visible
    } else {
        console.warn(`Message target element #${targetElementId} not found. Ensure a div with this ID exists.`);
    }
}

// Export the shared functionalities to be used by other scripts
export { ws, currentPoll, onPollUpdate, onGeneralMessage, sendMessage, showMessage };