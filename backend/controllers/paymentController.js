const db = require("../config/db");

// ======================================================
// COMPLETE PAYMENT
// ======================================================

async function completePayment(req, res) {
    try {
        const { requestId, paymentMethod } = req.body;

        // ------------------------------------------------
        // VALIDATION
        // ------------------------------------------------

        if (!requestId || !paymentMethod) {
            return res.status(400).json({
                message: "Request ID and payment method are required."
            });
        }

        // ------------------------------------------------
        // CHECK PAYMENT METHOD
        // ------------------------------------------------

        const allowedMethods = [
            "UPI",
            "Card",
            "Net Banking"
        ];

        if (!allowedMethods.includes(paymentMethod)) {
            return res.status(400).json({
                message: "Invalid payment method."
            });
        }

        // ------------------------------------------------
        // GET EVENT REQUEST
        // ------------------------------------------------

        const [requestRows] = await db.query(
            `SELECT
                request_id,
                customer_id,
                budget,
                status
             FROM event_request
             WHERE request_id = ?`,
            [requestId]
        );

        if (requestRows.length === 0) {
            return res.status(404).json({
                message: "Event request not found."
            });
        }

        const request = requestRows[0];

        // ------------------------------------------------
        // CHECK CUSTOMER
        // ------------------------------------------------

        if (!request.customer_id) {
            return res.status(400).json({
                message: "Customer information is missing for this request."
            });
        }

        // ------------------------------------------------
        // CHECK REQUEST STATUS
        // ------------------------------------------------

        if (request.status !== "payment_pending") {
            return res.status(400).json({
                message:
                    "This request is not currently waiting for payment."
            });
        }

        // ------------------------------------------------
        // GET PAYMENT
        // ------------------------------------------------

        const [paymentRows] = await db.query(
            `SELECT
                payment_id,
                amount,
                payment_status
             FROM event_payments
             WHERE request_id = ?
             ORDER BY payment_id DESC
             LIMIT 1`,
            [requestId]
        );

        // ------------------------------------------------
        // CREATE PAYMENT IF NOT FOUND
        // ------------------------------------------------

        let paymentId;
        let amount = Number(request.budget || 0);

        if (paymentRows.length === 0) {

            const [paymentResult] = await db.query(
                `INSERT INTO event_payments
                (
                    request_id,
                    customer_id,
                    amount,
                    payment_status,
                    payment_method,
                    transaction_id,
                    paid_at
                )
                VALUES (?, ?, ?, 'paid', ?, ?, NOW())`,
                [
                    requestId,
                    request.customer_id,
                    amount,
                    paymentMethod,
                    "ANN" + Date.now()
                ]
            );

            paymentId = paymentResult.insertId;

        } else {

            const existingPayment =
                paymentRows[0];

            paymentId =
                existingPayment.payment_id;

            amount =
                Number(existingPayment.amount || 0);

            // --------------------------------------------
            // CHECK IF ALREADY PAID
            // --------------------------------------------

            if (
                existingPayment.payment_status ===
                "paid"
            ) {
                return res.status(400).json({
                    message: "This payment has already been completed."
                });
            }

            // --------------------------------------------
            // UPDATE EXISTING PAYMENT
            // --------------------------------------------

            await db.query(
                `UPDATE event_payments
                 SET
                    payment_status = 'paid',
                    payment_method = ?,
                    transaction_id = ?,
                    paid_at = NOW()
                 WHERE payment_id = ?`,
                [
                    paymentMethod,
                    "ANN" + Date.now(),
                    paymentId
                ]
            );
        }

        // ------------------------------------------------
        // UPDATE EVENT REQUEST
        // ------------------------------------------------

        await db.query(
            `UPDATE event_request
             SET status = 'confirmed'
             WHERE request_id = ?`,
            [requestId]
        );

        // ------------------------------------------------
        // UPDATE EVENT TRACKING
        // ------------------------------------------------

        const [trackingRows] = await db.query(
            `SELECT tracking_id
             FROM event_tracking
             WHERE request_id = ?
             LIMIT 1`,
            [requestId]
        );

        if (trackingRows.length === 0) {

            await db.query(
                `INSERT INTO event_tracking
                (
                    request_id,
                    tracking_status
                )
                VALUES (?, 'payment_completed')`,
                [requestId]
            );

        } else {

            await db.query(
                `UPDATE event_tracking
                 SET tracking_status = 'payment_completed'
                 WHERE request_id = ?`,
                [requestId]
            );
        }

        // ------------------------------------------------
        // SUCCESS RESPONSE
        // ------------------------------------------------

        return res.status(200).json({
            message: "Payment completed successfully.",
            paymentId: paymentId,
            requestId: requestId,
            amount: amount,
            paymentMethod: paymentMethod,
            status: "confirmed"
        });

    } catch (error) {

        console.error(
            "Complete payment error:",
            error
        );

        return res.status(500).json({
            message: "Could not complete payment."
        });
    }
}


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    completePayment
};