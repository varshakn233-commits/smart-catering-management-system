
const express = require("express");
const router = express.Router();

const {
    createRequest,
    getCustomerRequests,
    getRequests,
    getCatererEvents,
    updateRequestStatus
} = require("../controllers/eventRequestController");

// Customer creates an event request
router.post("/", createRequest);

// Customer views their requests
router.get("/customer/:customerId", getCustomerRequests);

// Caterer views confirmed or accepted events
router.get("/caterer/:catererEmail/events", (req, res) => {
    req.params.email = req.params.catererEmail;
    return getCatererEvents(req, res);
});

// Caterer views requests using query email
router.get("/caterer", (req, res) => {
    const email = req.query.catererEmail || req.query.email;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Caterer email is required."
        });
    }

    req.query.catererEmail = email;
    return getRequests(req, res);
});

// Caterer views requests using email in URL
router.get("/caterer/:catererEmail", (req, res) => {
    req.query.catererEmail = req.params.catererEmail;
    return getRequests(req, res);
});

// Get all requests
router.get("/", getRequests);

// Accept or reject a request
router.put("/:id/status", updateRequestStatus);

module.exports = router;
