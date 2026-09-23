const express = require("express");

const router = express.Router();

const {
    completePayment
} = require("../controllers/paymentController");


router.post(
    "/complete",
    completePayment
);


module.exports = router;