const express = require("express");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so frontend on another domain can access backend
const cors = require("cors");
app.use(cors({
  origin: "https://afatmaa-frontend-real-time-polling-app.hosting.codeyourfuture.io", // Allow requests from this origin
  methods: ["GET", "POST"],        // Allow GET and POST methods
}));

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.static("public")); // Serve static files from the 'public' directory

// Poll data (stored in memory)
let currentPoll = {
  question: "What is your favorite programming language?",
  options: [
    { id: 1, text: "JavaScript", votes: 0 },
    { id: 2, text: "Python", votes: 0 },
    { id: 3, text: "Java", votes: 0 },
    { id: 4, text: "C++", votes: 0 },
  ],
};

// Track users who have voted (to prevent duplicate votes)
let votedUsers = new Set();

// Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Voting page: http://localhost:${PORT}`);
  console.log(`Results page: http://localhost:${PORT}/results.html`);
  console.log(`Admin page: http://localhost:${PORT}/admin.html`);
});

// Create WebSocket Server, attached to the HTTP server
const wss = new WebSocket.Server({ server });

/**
 * Broadcasts a message to all connected WebSocket clients.
 * @param {Object} data - The data object to send, will be JSON stringified.
 */
function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("New client connected");

  // Send initial poll data to the newly connected client
  ws.send(
    JSON.stringify({
      type: "poll-data",
      poll: currentPoll,
    }),
  );

  // Message listener for incoming WebSocket messages from clients
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      // Handle 'vote' message
      if (data.type === "vote") {
        const { optionId, userId } = data;

        // Prevent duplicate votes from the same user
        if (votedUsers.has(userId)) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "You already voted!",
            }),
          );
          return;
        }

        // Find the voted option and increment its vote count
        const option = currentPoll.options.find((opt) => opt.id === optionId);
        if (option) {
          option.votes++;
          votedUsers.add(userId); // Mark user as voted

          console.log(
            `Vote received: ${option.text} (Total: ${option.votes})`,
          );

          // Broadcast updated poll data to all clients
          broadcast({
            type: "poll-update",
            poll: currentPoll,
          });

          // Send confirmation to the voter
          ws.send(
            JSON.stringify({
              type: "vote-success",
              message: "Vote recorded!",
            }),
          );
        } else {
          ws.send(
            JSON.stringify({
                type: "error",
                message: "Invalid option selected.",
            })
          );
        }
      }

      // Handle 'create-poll' message (Admin functionality)
      if (data.type === "create-poll") {
        const { question, options } = data;

        // Validate options
        if (!question || !options || !Array.isArray(options) || options.length < 2) {
          ws.send(JSON.stringify({
              type: "error",
              message: "Invalid poll data. Question and at least 2 options are required."
          }));
          return;
        }

        // Create new poll structure
        currentPoll = {
          question,
          options: options.map((text, index) => ({
            id: index + 1,
            text,
            votes: 0,
          })),
        };

        votedUsers.clear(); // Reset voted users for the new poll

        console.log(`New poll created: ${question}`);

        // Broadcast new poll data to all clients
        broadcast({
          type: "poll-data",
          poll: currentPoll,
        });

        // Inform clients to reset their local vote status
        broadcast({
          type: "client-reset-vote-status",
        });
      }

      // Handle 'reset-votes' message (Admin functionality)
      if (data.type === "reset-votes") {
        currentPoll.options.forEach((opt) => (opt.votes = 0)); // Reset all vote counts
        votedUsers.clear(); // Clear all voted users

        console.log("Votes reset");

        // Broadcast updated poll data with reset votes
        broadcast({
          type: "poll-update",
          poll: currentPoll,
        });

        // Inform clients to reset their local vote status
        broadcast({
          type: "client-reset-vote-status",
        });
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  // When client disconnects
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// API Endpoints (optional - can also be used as REST API for initial data or non-realtime interactions)

// GET /api/poll: Returns the current poll data
app.get("/api/poll", (req, res) => {
  res.json(currentPoll);
});

// POST /api/vote: Allows voting via REST (less real-time, mainly for demonstration)
app.post("/api/vote", (req, res) => {
  const { optionId, userId } = req.body;

  if (votedUsers.has(userId)) {
    return res.status(400).json({ error: "Already voted" });
  }

  const option = currentPoll.options.find((opt) => opt.id === optionId);
  if (option) {
    option.votes++;
    votedUsers.add(userId);

    // Broadcast update to all WebSocket clients (even if voted via REST)
    broadcast({
      type: "poll-update",
      poll: currentPoll,
    });

    res.json({ success: true, poll: currentPoll });
  } else {
    res.status(404).json({ error: "Option not found" });
  }
});
