const db = require("../config/db");


// =====================================================
// GET CUSTOMER REVIEWS
// =====================================================

async function getCustomerReviews(req, res) {
    try {

        const { customerId } = req.params;

        if (!customerId) {
            return res.status(400).json({
                message: "Customer ID is required."
            });
        }


        const [rows] = await db.query(
            `SELECT
                r.review_id,
                r.customer_id,
                r.caterer_id,
                r.rating,
                r.review_text,
                r.created_at,
                r.updated_at,
                c.brand_name AS caterer_name
             FROM reviews r
             INNER JOIN caterers c
                ON r.caterer_id = c.caterer_id
             WHERE r.customer_id = ?
             ORDER BY r.created_at DESC`,
            [customerId]
        );


        return res.status(200).json({
            reviews: rows
        });


    } catch (error) {

        console.error(
            "Get customer reviews error:",
            error
        );


        return res.status(500).json({
            message: "Could not fetch reviews."
        });

    }
}



// =====================================================
// CREATE REVIEW
// =====================================================

async function createReview(req, res) {
    try {

        const {
            customerId,
            catererId,
            rating,
            reviewText
        } = req.body;


        if (
            !customerId ||
            !catererId ||
            !rating
        ) {
            return res.status(400).json({
                message:
                    "Customer ID, caterer ID and rating are required."
            });
        }


        const numericRating =
            Number(rating);


        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                message:
                    "Rating must be between 1 and 5."
            });
        }


        const [result] = await db.query(
            `INSERT INTO reviews
            (
                customer_id,
                caterer_id,
                rating,
                review_text
            )
            VALUES (?, ?, ?, ?)`,
            [
                customerId,
                catererId,
                numericRating,
                reviewText || null
            ]
        );


        return res.status(201).json({
            message: "Review submitted successfully.",
            reviewId: result.insertId
        });


    } catch (error) {

        console.error(
            "Create review error:",
            error
        );


        return res.status(500).json({
            message: "Could not submit review."
        });

    }
}



// =====================================================
// DELETE REVIEW
// =====================================================

async function deleteReview(req, res) {
    try {

        const { id } = req.params;


        if (!id) {
            return res.status(400).json({
                message: "Review ID is required."
            });
        }


        const [result] = await db.query(
            `DELETE FROM reviews
             WHERE review_id = ?`,
            [id]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Review not found."
            });

        }


        return res.status(200).json({
            message: "Review deleted successfully."
        });


    } catch (error) {

        console.error(
            "Delete review error:",
            error
        );


        return res.status(500).json({
            message: "Could not delete review."
        });

    }
}



module.exports = {
    getCustomerReviews,
    createReview,
    deleteReview
};