const express = require("express");

const router = express.Router();

const {
    signup,
    login,
    getCustomerProfile,
    updateCustomerProfile
} = require("../controllers/customerAuthController");


// =====================================================
// CUSTOMER SIGNUP
// =====================================================

router.post(
    "/signup",
    signup
);


// =====================================================
// CUSTOMER LOGIN
// =====================================================

router.post(
    "/login",
    login
);


// =====================================================
// GET CUSTOMER PROFILE
// =====================================================

router.get(
    "/:customerId",
    getCustomerProfile
);


// =====================================================
// UPDATE CUSTOMER PROFILE
// =====================================================

router.put(
    "/:customerId",
    updateCustomerProfile
);


module.exports = router;