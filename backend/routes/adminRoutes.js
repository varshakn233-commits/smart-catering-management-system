const express = require("express");

const router = express.Router();

const {
    login,
    listCaterers,
    updateCatererStatus,

    getCustomerSummary,
    listCustomers,
    getCustomerDetails,
    updateCustomerStatus

} = require("../controllers/adminController");

const verifyAdminToken =
    require("../middleware/verifyAdminToken");


// =====================================================
// ADMIN LOGIN
// =====================================================

router.post(
    "/login",
    login
);


// =====================================================
// CATERER MANAGEMENT
// =====================================================

router.get(
    "/caterers",
    verifyAdminToken,
    listCaterers
);

router.put(
    "/caterers/:id/status",
    verifyAdminToken,
    updateCatererStatus
);


// =====================================================
// CUSTOMER MANAGEMENT
// =====================================================

router.get(
    "/customers/summary",
    verifyAdminToken,
    getCustomerSummary
);

router.get(
    "/customers",
    verifyAdminToken,
    listCustomers
);

router.get(
    "/customers/:id",
    verifyAdminToken,
    getCustomerDetails
);

router.put(
    "/customers/:id/status",
    verifyAdminToken,
    updateCustomerStatus
);


module.exports = router;