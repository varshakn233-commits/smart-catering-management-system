
const express = require("express");
const router = express.Router();

const contactController = require("../controllers/contactMessageController");

// Visitor submits a contact message
router.post("/", contactController.createContactMessage);

// Admin views contact messages
router.get("/", contactController.getContactMessages);

// Admin replies to a contact message
router.post("/:id/reply", contactController.replyToContactMessage);

module.exports = router;
