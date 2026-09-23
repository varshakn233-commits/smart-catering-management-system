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


        // Get event request details
        const [requestRows] = await db.query(
            `SELECT
                request_id,
                customer_id,
                customer_name,
                event_type,
                event_date,
                event_time,
                venue_location,
                status,
                accepted_by
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


        // Get tracking information
        const [trackingRows] = await db.query(
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
            tracking = trackingRows[0];
        }


        return res.status(200).json({

            request: request,

            tracking: tracking

        });


    } catch (error) {

        console.error(
            "Get customer tracking error:",
            error
        );

        return res.status(500).json({
            message: "Could not fetch event tracking."
        });
    }
}


module.exports = {
    getCustomerTracking
};