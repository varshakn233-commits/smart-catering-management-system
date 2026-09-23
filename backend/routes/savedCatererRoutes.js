const express = require("express");

const router = express.Router();

const {
    saveCaterer,
    removeSavedCaterer,
    getSavedCaterers
} = require("../controllers/savedCatererController");


// SAVE CATERER
router.post("/save", saveCaterer);


// REMOVE SAVED CATERER
router.delete("/remove", removeSavedCaterer);


// GET CUSTOMER'S SAVED CATERERS
router.get("/:customerId", getSavedCaterers);


module.exports = router;