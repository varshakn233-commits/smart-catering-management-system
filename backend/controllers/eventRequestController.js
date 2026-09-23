const db = require("../config/db");


// =====================================================
// CREATE EVENT REQUEST
// =====================================================

async function createRequest(req, res) {
    try {

        const {
            customerId,
            customerName,
            phone,
            email,
            eventType,
            eventDate,
            eventTime,
            venueLocation,
            guestCount,
            foodType,
            packageName,
            budget,
            cateringService,
            specialRequirements,
            message,
            catererEmail
        } = req.body;


        // Required fields
        if (
            !customerName ||
            !phone ||
            !email ||
            !eventType ||
            !eventDate ||
            !eventTime ||
            !venueLocation ||
            !guestCount ||
            !foodType ||
            !catererEmail
        ) {

            return res.status(400).json({
                message: "Please fill all required fields."
            });

        }


        const [result] = await db.query(
            `INSERT INTO event_request
            (
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
                caterer_email
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customerId || null,
                customerName,
                phone,
                email,
                eventType,
                eventDate,
                eventTime,
                venueLocation,
                guestCount,
                foodType,
                packageName || null,
                budget || null,
                cateringService || null,
                specialRequirements || null,
                message || null,
                catererEmail
            ]
        );


        return res.status(201).json({
            message: "Event request sent successfully!",
            requestId: result.insertId
        });


    } catch (error) {

        console.error(
            "Create request error:",
            error
        );

        return res.status(500).json({
            message: "Could not send event request."
        });

    }
}



// =====================================================
// GET CUSTOMER'S OWN EVENT REQUESTS
// =====================================================

async function getCustomerRequests(req, res) {
    try {

        const { customerId } = req.params;


        if (!customerId) {

            return res.status(400).json({
                message: "Customer ID is required."
            });

        }


        const [rows] = await db.query(
            `SELECT
                er.request_id,
                er.customer_id,
                er.customer_name,
                er.event_type,
                er.event_date,
                er.event_time,
                er.food_type,
                er.status,
                er.created_at,
                er.caterer_email,
                c.brand_name AS caterer_name
             FROM event_request er
             LEFT JOIN caterers c
                ON er.caterer_email = c.email
             WHERE er.customer_id = ?
             ORDER BY er.created_at DESC`,
            [customerId]
        );


        return res.status(200).json({
            requests: rows
        });


    } catch (error) {

        console.error(
            "Get customer requests error:",
            error
        );

        return res.status(500).json({
            message: "Could not fetch customer requests."
        });

    }
}



// =====================================================
// GET ALL EVENT REQUESTS
// =====================================================

async function getRequests(req, res) {
    try {

        const [rows] = await db.query(
            `SELECT
                er.*,
                c.brand_name AS caterer_name
             FROM event_request er
             LEFT JOIN caterers c
                ON er.accepted_by = c.caterer_id
             ORDER BY er.created_at DESC`
        );


        return res.status(200).json({
            requests: rows
        });


    } catch (error) {

        console.error(
            "Get requests error:",
            error
        );

        return res.status(500).json({
            message: "Could not fetch event requests."
        });

    }
}



// =====================================================
// UPDATE REQUEST STATUS
// =====================================================

async function updateRequestStatus(req, res) {
    try {

        const { id } = req.params;

        const {
            status,
            catererId
        } = req.body;


        // Only caterer actions are allowed here
        if (
            !["accepted", "rejected"].includes(status)
        ) {

            return res.status(400).json({
                message: "Invalid status."
            });

        }


        // =================================================
        // UPDATE EVENT REQUEST
        // =================================================

        const [result] = await db.query(
            `UPDATE event_request
             SET
                status = ?,
                accepted_by = ?
             WHERE request_id = ?`,
            [
                status,
                catererId || null,
                id
            ]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Request not found."
            });

        }


        // =================================================
        // IF CATERER ACCEPTS THE REQUEST
        // =================================================

        if (status === "accepted") {

            // Get customer ID and budget
            const [requestRows] = await db.query(
                `SELECT
                    customer_id,
                    budget
                 FROM event_request
                 WHERE request_id = ?`,
                [id]
            );


            if (requestRows.length > 0) {

                const request =
                    requestRows[0];


                // =========================================
                // CREATE PAYMENT RECORD
                // =========================================

                await db.query(
                    `INSERT INTO event_payments
                    (
                        request_id,
                        customer_id,
                        amount,
                        payment_status
                    )
                    VALUES (?, ?, ?, 'pending')`,
                    [
                        id,
                        request.customer_id,
                        request.budget || 0
                    ]
                );


                // =========================================
                // CREATE EVENT TRACKING RECORD
                // =========================================

                await db.query(
                    `INSERT INTO event_tracking
                    (
                        request_id,
                        tracking_status
                    )
                    VALUES (?, 'caterer_accepted')`,
                    [id]
                );


                // =========================================
                // CHANGE REQUEST TO PAYMENT PENDING
                // =========================================

                await db.query(
                    `UPDATE event_request
                     SET status = 'payment_pending'
                     WHERE request_id = ?`,
                    [id]
                );

            }

        }


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            message:
                status === "accepted"
                    ? "Request accepted. Payment is now pending."
                    : "Request rejected successfully."

        });


    } catch (error) {

        console.error(
            "Update request error:",
            error
        );

        return res.status(500).json({
            message:
                "Could not update event request."
        });

    }
}



// =====================================================
// EXPORT FUNCTIONS
// =====================================================

module.exports = {
    createRequest,
    getCustomerRequests,
    getRequests,
    updateRequestStatus
};