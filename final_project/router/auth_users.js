const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js"); // Assuming books are stored in an object
const regd_users = express.Router();

let users = []; // Stores registered users

// ✅ Helper function: Check if a username is already registered
const isValid = (username) => users.some(user => user.username === username);

// ✅ Helper function: Authenticate user with username & password
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// ✅ Task 7: User Login (JWT Authentication)
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

        req.session.authorization = { accessToken, username };

        return res.status(200).json({
            message: "User successfully logged in",
            accessToken: accessToken
        });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// ✅ Task 8: Add or Modify a Book Review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const review = req.query.review; // Passed as a query parameter
    const username = req.session.authorization?.username; // Get username from session

    if (!username) {
        return res.status(401).json({ message: "Unauthorized: Please log in first" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review cannot be empty" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: `ISBN ${isbn} not found` });
    }

    // ✅ Ensure reviews exist in the book
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // ✅ Add or update review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review successfully posted/updated",
        reviews: books[isbn].reviews
    });
});

// ✅ Task 9: Delete a Book Review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(401).json({ message: "Unauthorized: Please log in first" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: `ISBN ${isbn} not found` });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found to delete" });
    }

    // ✅ Delete review
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review successfully deleted" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
