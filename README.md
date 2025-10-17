# Real-Time Polling App

## Project Overview

This is a real-time polling application that allows users to vote on questions and see results updated instantly. It features a separate backend server and a frontend client, communicating using WebSockets for live updates.

## Key Features

*   **Real-Time Voting:** Users can cast their votes and see the results update across all connected clients immediately.
*   **Live Results Display:** A dedicated page shows the current poll question and a visual representation of vote counts and percentages in real time.
*   **Admin Panel:** An administration interface allows creating new polls with custom questions and options, and resetting existing poll votes.
*   **Unique User Tracking:** Prevents users from voting multiple times on the same poll.

## Live Application

You can try out the live application here:

*   **Frontend (Voting/Results/Admin):** [https://afatmaa-frontend-real-time-polling-app.hosting.codeyourfuture.io/](https://afatmaa-frontend-real-time-polling-app.hosting.codeyourfuture.io/)

    *(Note: The main page is for voting. You can navigate to `/results.html` for live results and `/admin.html` to manage polls.)*

## Technologies Used

*   **Backend:**
    *   Node.js
    *   Express.js (for HTTP server and routing)
    *   `ws` (WebSocket library for real-time communication)
    *   `cors` (for handling Cross-Origin Resource Sharing)
*   **Frontend:**
    *   HTML5
    *   CSS3 
    *   Vanilla JavaScript

## Project Structure

The project is divided into two main parts:

*   `backend/`: Contains the Node.js Express server. This handles WebSocket connections, manages poll data (stored in memory), and broadcasts updates to clients.
*   `frontend/`: Contains all client-side files, including HTML pages (`index.html`, `results.html`, `admin.html`), CSS (`style.css`), and modular JavaScript files (`js/shared.js`, `js/vote.js`, `js/admin.js`, `js/results.js`).

## Getting Started (Local Development)

To run this project on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AFatmaa/Real-Time-Polling-App.git
    cd real-time-polling-app
    ```
2.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install
    ```
3.  **Start the backend server:**
    ```bash
    npm start # Or `node server.js`
    ```
    The backend will start on `http://localhost:3000`. You will see messages in your terminal.
4.  **Open frontend files:**
    *   Navigate to the `frontend/` directory.
    *   Open `index.html` (for voting), `results.html` (for live results), and `admin.html` (for poll management) directly in your web browser. Make sure your browser allows local file access or use a simple HTTP server (e.g., `npx http-server frontend/` if you have Node.js installed globally).

## Deployment

The application is deployed on Coolify.

*   **Backend Deployment URL:** [https://afatmaa-backend-real-time-polling-app.hosting.codeyourfuture.io/](https://afatmaa-real-time-polling-app.hosting.codeyourfuture.io/)

*   **Frontend Deployment URL:** [https://afatmaa-frontend-real-time-polling-app.hosting.codeyourfuture.io/](https://afatmaa-frontend-real-time-polling-app.hosting.codeyourfuture.io/)

---