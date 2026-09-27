const express = require("express");

const router = express.Router();

const {
    sendForgotPasswordOTP,
    verifyForgotPasswordOTP,
    resetPassword
} = require("../controllers/forgotPasswordController");


/*
=====================================================
SEND OTP
=====================================================
*/

router.post(
    "/:accountType/forgot",
    sendForgotPasswordOTP
);


/*
=====================================================
VERIFY OTP
=====================================================
*/

router.post(
    "/:accountType/verify",
    verifyForgotPasswordOTP
);


/*
=====================================================
RESET PASSWORD
=====================================================
*/

router.post(
    "/:accountType/reset",
    resetPassword
);


module.exports = router;