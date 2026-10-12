
const express = require("express");
const router = express.Router();

const {
    createContactMessage,
    getContactMessages,
    replyToContactMessage
} = require("../controllers/contactMessageController");

// Visitor submits a Contact Us message
router.post("/", createContactMessage);

// Admin views submitted contact messages
router.get("/", getContactMessages);

// Admin replies to a visitor
router.post("/:id/reply", replyToContactMessage);

module.exports = router;
