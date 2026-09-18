const express = require("express");

const router = express.Router();

const {
    createRequest,
    getRequests,
    updateRequestStatus
} = require("../controllers/eventRequestController");


router.post("/", createRequest);

router.get("/", getRequests);

router.put("/:id/status", updateRequestStatus);


module.exports = router;