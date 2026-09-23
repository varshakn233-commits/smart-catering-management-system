const express = require("express");

const router = express.Router();

const {
    getCustomerReviews,
    createReview,
    deleteReview
} = require("../controllers/reviewController");


// =====================================================
// GET CUSTOMER REVIEWS
// =====================================================

router.get(
    "/:customerId",
    getCustomerReviews
);


// =====================================================
// CREATE REVIEW
// =====================================================

router.post(
    "/",
    createReview
);


// =====================================================
// DELETE REVIEW
// =====================================================

router.delete(
    "/:id",
    deleteReview
);


module.exports = router;