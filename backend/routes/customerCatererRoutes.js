const express = require("express");

const router = express.Router();

const {
    getApprovedCaterers
} = require("../controllers/customerCatererController");

router.get("/approved", getApprovedCaterers);

module.exports = router;