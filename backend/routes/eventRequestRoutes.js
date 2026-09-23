const express = require("express");

const router = express.Router();

const {
    createRequest,
    getCustomerRequests,
    getRequests,
    updateRequestStatus
} = require("../controllers/eventRequestController");


// CUSTOMER - CREATE EVENT REQUEST
router.post("/", createRequest);


// CUSTOMER - GET OWN REQUESTS
router.get("/customer/:customerId", getCustomerRequests);


// CATERER / ADMIN - GET ALL REQUESTS
router.get("/", getRequests);


// UPDATE REQUEST STATUS
router.put("/:id/status", updateRequestStatus);


module.exports = router;