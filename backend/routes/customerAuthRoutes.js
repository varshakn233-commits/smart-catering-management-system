const express = require("express");

const router = express.Router();

const {
    signup,
    login,
    changePassword,
    getCustomerProfile,
    updateCustomerProfile
} = require("../controllers/customerAuthController");

const verifyCustomerToken =
    require("../middleware/verifyCustomerToken");


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
// CHANGE CUSTOMER PASSWORD
// =====================================================

router.put(
    "/change-password",
    verifyCustomerToken,
    changePassword
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