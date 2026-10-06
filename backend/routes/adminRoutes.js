const express = require("express");

const router = express.Router();

const {
    login,
    changeAdminPassword,

    // CATERERS
    listCaterers,
    updateCatererStatus,

    // CUSTOMERS
    getCustomerSummary,
    listCustomers,
    getCustomerDetails,
    updateCustomerStatus,

    // PAYMENTS
    getPaymentSummary,
    listPayments,
    getPaymentDetails,

    // REVIEWS
    getReviewSummary,
    listReviews,
    getReviewDetails,

    // REPORTS
    getReportsOverview,
    getBookingReport,
    getRevenueReport,
    getCustomerReport,
    getCatererReport,
    getEventTypeReport,
    getReviewReport,
    getCatererPerformance

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
// ADMIN CHANGE PASSWORD
// =====================================================

router.put(
    "/change-password",
    verifyAdminToken,
    changeAdminPassword
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


// =====================================================
// PAYMENT MANAGEMENT
// =====================================================

router.get(
    "/payments/summary",
    verifyAdminToken,
    getPaymentSummary
);

router.get(
    "/payments",
    verifyAdminToken,
    listPayments
);

router.get(
    "/payments/:id",
    verifyAdminToken,
    getPaymentDetails
);


// =====================================================
// REVIEW MANAGEMENT
// =====================================================

router.get(
    "/reviews/summary",
    verifyAdminToken,
    getReviewSummary
);

router.get(
    "/reviews",
    verifyAdminToken,
    listReviews
);

router.get(
    "/reviews/:id",
    verifyAdminToken,
    getReviewDetails
);


// =====================================================
// REPORTS & ANALYTICS
// =====================================================

router.get(
    "/reports/overview",
    verifyAdminToken,
    getReportsOverview
);

router.get(
    "/reports/bookings",
    verifyAdminToken,
    getBookingReport
);

router.get(
    "/reports/revenue",
    verifyAdminToken,
    getRevenueReport
);

router.get(
    "/reports/customers",
    verifyAdminToken,
    getCustomerReport
);

router.get(
    "/reports/caterers",
    verifyAdminToken,
    getCatererReport
);

router.get(
    "/reports/event-types",
    verifyAdminToken,
    getEventTypeReport
);

router.get(
    "/reports/reviews",
    verifyAdminToken,
    getReviewReport
);

router.get(
    "/reports/caterer-performance",
    verifyAdminToken,
    getCatererPerformance
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;