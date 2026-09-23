const express = require("express");

const router = express.Router();

const {
    getCustomerTracking
} = require("../controllers/trackingController");


// Get tracking details for a request
router.get(
    "/:requestId",
    getCustomerTracking
);


module.exports = router;