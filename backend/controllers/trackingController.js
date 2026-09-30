const db = require("../config/db");

// ======================================================
// GET TRACKING FOR CUSTOMER
// ======================================================

async function getCustomerTracking(req, res) {
    try {

        const { requestId } = req.params;

        if (!requestId) {
            return res.status(400).json({
                message: "Request ID is required."
            });
        }


        // ==================================================
        // GET EVENT REQUEST DETAILS
        // ==================================================

        const [requestRows] = await db.query(
            `SELECT
                request_id,
                enquiry_id,
                customer_id,
                customer_name,
                phone,
                email,
                event_type,
                event_date,
                event_time,
                venue_location,
                guest_count,
                food_type,
                package_name,
                budget,
                catering_service,
                special_requirements,
                message,
                caterer_email,
                status,
                accepted_by,
                created_at
             FROM event_request
             WHERE request_id = ?`,
            [requestId]
        );


        if (requestRows.length === 0) {

            return res.status(404).json({
                message: "Event request not found."
            });

        }


        const request =
            requestRows[0];


        // ==================================================
        // GET ENQUIRY DETAILS
        // ==================================================

        let enquiry = null;


        if (request.enquiry_id) {

            const [enquiryRows] =
                await db.query(
                    `SELECT
                        enquiry_id,
                        customer_id,
                        customer_name,
                        caterer_name,
                        caterer_email,
                        event_type,
                        event_date,
                        event_time,
                        venue_location,
                        guest_count,
                        food_type,
                        package_name,
                        budget,
                        catering_service,
                        special_requirements,
                        message,
                        caterer_reply,
                        status,
                        created_at,
                        replied_at
                     FROM customer_enquiries
                     WHERE enquiry_id = ?`,
                    [request.enquiry_id]
                );


            if (enquiryRows.length > 0) {

                enquiry =
                    enquiryRows[0];

            }

        }


        // ==================================================
        // GET TRACKING INFORMATION
        // ==================================================

        const [trackingRows] =
            await db.query(
                `SELECT
                    tracking_id,
                    request_id,
                    tracking_status,
                    updated_at
                 FROM event_tracking
                 WHERE request_id = ?
                 ORDER BY tracking_id DESC
                 LIMIT 1`,
                [requestId]
            );


        let tracking = null;


        if (trackingRows.length > 0) {

            tracking =
                trackingRows[0];

        }


        // ==================================================
        // GET PAYMENT INFORMATION
        // ==================================================

        const [paymentRows] =
            await db.query(
                `SELECT
                    payment_id,
                    request_id,
                    amount,
                    payment_status,
                    payment_method,
                    transaction_id,
                    paid_at,
                    created_at
                 FROM event_payments
                 WHERE request_id = ?
                 ORDER BY payment_id DESC
                 LIMIT 1`,
                [requestId]
            );


        let payment = null;


        if (paymentRows.length > 0) {

            payment =
                paymentRows[0];

        }


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            request: request,

            enquiry: enquiry,

            tracking: tracking,

            payment: payment

        });


    } catch (error) {

        console.error(
            "Get customer tracking error:",
            error
        );


        return res.status(500).json({
            message:
                "Could not fetch event tracking."
        });

    }
}


module.exports = {
    getCustomerTracking
};