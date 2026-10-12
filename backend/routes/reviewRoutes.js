const express = require("express");
const router = express.Router();

const {
    getCustomerReviews,
    getCatererReviews,
    createReview,
    deleteReview
} = require("../controllers/reviewController");


// =====================================================
// GET REVIEWS
// =====================================================

router.get("/:id", (req, res) => {

    // Caterer Reviews
    if (
        req.baseUrl ===
        "/api/caterer/reviews"
    ) {

        req.params.catererId =
            req.params.id;

        return getCatererReviews(
            req,
            res
        );
    }


    // Customer Reviews
    req.params.customerId =
        req.params.id;

    return getCustomerReviews(
        req,
        res
    );
});


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