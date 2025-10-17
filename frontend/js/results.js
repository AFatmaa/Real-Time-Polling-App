// Import shared WebSocket functionalities and helpers
import { ws, onPollUpdate, onGeneralMessage, showMessage } from './shared.js';

// Local copy of the current poll data for this page
let currentPollData = null;

// Register a callback to handle poll data updates from the server
onPollUpdate((poll) => {
    currentPollData = poll;
    renderResults(currentPollData); // Re-render results whenever poll data updates
});

// Register a callback to handle general messages (e.g., server errors)
onGeneralMessage((data) => {
    if (data.type === "error") {
        // Display server errors if any, though less critical for results page
        showMessage("Server Error: " + data.message, "error", "message"); // Assuming a message div exists
    }
});

// Custom handling for WebSocket disconnection on this page
ws.onclose = () => {
    console.log("Disconnected from server (Results Page)");
    // Optionally display a message, but results are often static after load.
};

/**
 * Renders the poll results, including the question, total votes, and a bar chart
 * visualization for each option's percentage.
 * @param {Object} poll - The poll object containing question and options with votes.
 */
function renderResults(poll) {
    // Display the poll question
    document.getElementById("question").textContent = poll.question;

    // Calculate and display total votes
    const totalVotes = poll.options.reduce(
        (sum, opt) => sum + opt.votes,
        0,
    );
    document.getElementById("total-votes").textContent = totalVotes;

    // Clear previous results and render new ones
    const container = document.getElementById("results-container");
    container.innerHTML = "";

    // Iterate through options to create bar chart visualization
    poll.options.forEach((option, index) => {
        const percentage =
            totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;

        // Create main result item container
        const resultDiv = document.createElement("div");
        resultDiv.className = "result-item";

        // Create info section (option name and vote count/percentage)
        const infoDiv = document.createElement("div");
        infoDiv.className = "result-info";

        const nameSpan = document.createElement("span");
        nameSpan.className = "option-name";
        nameSpan.textContent = option.text;

        const votesSpan = document.createElement("span");
        votesSpan.className = "vote-count";
        votesSpan.textContent = `${option.votes} votes (${percentage.toFixed(1)}%)`;

        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(votesSpan);

        // Create bar container for the visual bar chart
        const barContainer = document.createElement("div");
        barContainer.className = "bar-container";

        // Create the actual bar element
        const bar = document.createElement("div");
        bar.className = "bar bar-color-" + (index % 4); // Apply a color class
        bar.style.width = "0%"; // Initialize width to 0 for animation

        barContainer.appendChild(bar);

        // Append all parts to the result item
        resultDiv.appendChild(infoDiv);
        resultDiv.appendChild(barContainer);
        container.appendChild(resultDiv);

        // Animate the bar width after a short delay to ensure DOM rendering
        setTimeout(() => {
            bar.style.transition = "width 0.8s ease-out"; // Smooth transition for the bar
            bar.style.width = percentage + "%";
        }, 100);
    });
}