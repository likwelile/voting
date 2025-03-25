const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Storage for votes and voters
let votes = {}; // Store votes for each candidate
let voters = {}; // Track voters by IP address
let totalVotes = 0; // Total votes cast

// Function to check if the voter has already voted
function hasAlreadyVoted(req) {
    const voterIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const voterCookie = req.cookies.voter;
    return voters[voterIP] || voterCookie === "voted";
}

// Route to handle voting
app.post("/vote", (req, res) => {
    const { candidate1, candidate2 } = req.body;

    // Check if the voter has already voted
    if (hasAlreadyVoted(req)) {
        return res.status(403).send("Umepiga kura tayari! Kura zaidi haziruhusiwi.");
    }

    const voterIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // Update votes
    votes[candidate1] = (votes[candidate1] || 0) + 1;
    votes[candidate2] = (votes[candidate2] || 0) + 1;
    totalVotes++;

    // Mark the voter as having voted
    voters[voterIP] = true;
    res.cookie("voter", "voted", { maxAge: 24 * 60 * 60 * 1000 }); // Cookie expires in 24 hours

    res.send("Kura zako zimepokelewa! Asante.");
});

// Route to get voting results
app.get("/results", (req, res) => {
    const winner = Object.keys(votes).reduce((a, b) => (votes[a] > votes[b] ? a : b), "No votes yet");
    const results = {
        totalVotes,
        votes,
        winner: votes[winner] ? winner : "Hakuna mshindi bado",
    };
    res.json(results);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
