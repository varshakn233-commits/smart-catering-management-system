const db = require("../config/db");

// ======================================================
// COMPLETE PAYMENT
// ======================================================

async function completePayment(req, res) {
    let connection;

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
        // START TRANSACTION
        // ------------------------------------------------

        connection = await db.getConnection();

        await connection.beginTransaction();

        // ------------------------------------------------
        // GET AND LOCK EVENT REQUEST
        // ------------------------------------------------

        const [requestRows] = await connection.query(
            `SELECT
                request_id,
                customer_id,
                budget,
                status
             FROM event_request
             WHERE request_id = ?
             FOR UPDATE`,
            [requestId]
        );

        if (requestRows.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Event request not found."
            });
        }

        const request = requestRows[0];

        // ------------------------------------------------
        // CHECK CUSTOMER
        // ------------------------------------------------

        if (!request.customer_id) {
            await connection.rollback();

            return res.status(400).json({
                message: "Customer information is missing for this request."
            });
        }

        // ------------------------------------------------
        // CHECK BOOKING STATUS
        // ------------------------------------------------

        if (request.status !== "payment_pending") {
            await connection.rollback();

            return res.status(400).json({
                message:
                    "This request is not currently waiting for payment."
            });
        }

        // ------------------------------------------------
        // GET AND LOCK PAYMENT
        // ------------------------------------------------

        const [paymentRows] = await connection.query(
            `SELECT
                payment_id,
                amount,
                payment_status
             FROM event_payments
             WHERE request_id = ?
             ORDER BY payment_id DESC
             LIMIT 1
             FOR UPDATE`,
            [requestId]
        );

        let paymentId;
        let amount = Number(request.budget || 0);

        const transactionId = "ANN" + Date.now();

        // ------------------------------------------------
        // CREATE PAYMENT IF NONE EXISTS
        // ------------------------------------------------

        if (paymentRows.length === 0) {

            const [paymentResult] = await connection.query(
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
                    transactionId
                ]
            );

            paymentId = paymentResult.insertId;

        } else {

            const existingPayment = paymentRows[0];

            paymentId = existingPayment.payment_id;
            amount = Number(existingPayment.amount || 0);

            // --------------------------------------------
            // PREVENT DUPLICATE PAYMENT
            // --------------------------------------------

            if (existingPayment.payment_status === "paid") {
                await connection.rollback();

                return res.status(400).json({
                    message: "This payment has already been completed."
                });
            }

            // --------------------------------------------
            // PREVENT REUSE OF REFUNDED PAYMENT
            // --------------------------------------------

            if (existingPayment.payment_status === "refunded") {
                await connection.rollback();

                return res.status(400).json({
                    message: "This payment has already been refunded."
                });
            }

            // --------------------------------------------
            // UPDATE EXISTING PAYMENT
            // --------------------------------------------

            await connection.query(
                `UPDATE event_payments
                 SET
                    payment_status = 'paid',
                    payment_method = ?,
                    transaction_id = ?,
                    paid_at = NOW(),
                    failed_at = NULL
                 WHERE payment_id = ?`,
                [
                    paymentMethod,
                    transactionId,
                    paymentId
                ]
            );
        }

        // ------------------------------------------------
        // CONFIRM BOOKING AFTER PAYMENT UPDATE
        // ------------------------------------------------

        await connection.query(
            `UPDATE event_request
             SET status = 'confirmed'
             WHERE request_id = ?
               AND status = 'payment_pending'`,
            [requestId]
        );

        // ------------------------------------------------
        // UPDATE EVENT TRACKING
        // ------------------------------------------------

        const [trackingRows] = await connection.query(
            `SELECT tracking_id
             FROM event_tracking
             WHERE request_id = ?
             LIMIT 1`,
            [requestId]
        );

        if (trackingRows.length === 0) {

            await connection.query(
                `INSERT INTO event_tracking
                (
                    request_id,
                    tracking_status
                )
                VALUES (?, 'payment_completed')`,
                [requestId]
            );

        } else {

            await connection.query(
                `UPDATE event_tracking
                 SET tracking_status = 'payment_completed'
                 WHERE request_id = ?`,
                [requestId]
            );
        }

        // ------------------------------------------------
        // COMMIT TRANSACTION
        // ------------------------------------------------

        await connection.commit();

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

        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Payment rollback error:",
                    rollbackError
                );
            }
        }

        console.error(
            "Complete payment error:",
            error
        );

        return res.status(500).json({
            message: "Could not complete payment."
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    completePayment
};