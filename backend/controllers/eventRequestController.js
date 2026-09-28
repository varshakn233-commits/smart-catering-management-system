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


        // =================================================
        // REQUIRED FIELD VALIDATION
        // =================================================

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


        // =================================================
        // CREATE EVENT REQUEST
        // =================================================

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
                caterer_email,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,

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

            message:
                "Could not send event request."

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

                message:
                    "Customer ID is required."

            });

        }


        const [rows] = await db.query(

            `SELECT
                er.request_id,
                er.customer_id,
                er.customer_name,
                er.phone,
                er.email,
                er.event_type,
                er.event_date,
                er.event_time,
                er.venue_location,
                er.guest_count,
                er.food_type,
                er.package_name,
                er.budget,
                er.catering_service,
                er.special_requirements,
                er.message,
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

            message:
                "Could not fetch customer requests."

        });

    }

}



// =====================================================
// GET CATERER'S EVENT REQUESTS
//
// IMPORTANT:
// Send catererEmail in the query:
//
// /api/requests?catererEmail=caterer@gmail.com
//
// This prevents the caterer page from showing
// unrelated customer requests.
// =====================================================

async function getRequests(req, res) {

    try {

        const {
            catererEmail
        } = req.query;


        let query = `

            SELECT

                er.request_id,
                er.customer_id,
                er.customer_name,
                er.phone,
                er.email,

                er.event_type,
                er.event_date,
                er.event_time,

                er.venue_location,
                er.guest_count,

                er.food_type,
                er.package_name,

                er.budget,
                er.catering_service,

                er.special_requirements,
                er.message,

                er.caterer_email,

                er.status,
                er.accepted_by,
                er.created_at

            FROM event_request er

        `;


        const queryParams = [];


        // =================================================
        // FILTER BY CATERER
        // =================================================

        if (catererEmail) {

            query += `
                WHERE LOWER(er.caterer_email) = LOWER(?)
            `;

            queryParams.push(
                catererEmail.trim()
            );

        }


        query += `

            ORDER BY er.created_at DESC

        `;


        const [rows] = await db.query(

            query,

            queryParams

        );


        return res.status(200).json({

            requests: rows

        });


    } catch (error) {

        console.error(

            "Get event requests error:",
            error

        );

        return res.status(500).json({

            message:
                "Could not fetch event requests."

        });

    }

}



// =====================================================
// GET CATERER'S CONFIRMED / UPCOMING EVENTS
//
// An accepted request becomes payment_pending in the
// existing application flow, so both accepted and
// payment_pending requests are treated as upcoming events.
// =====================================================

async function getCatererEvents(req, res) {

    try {

        const {
            catererEmail
        } = req.query;


        if (!catererEmail) {

            return res.status(400).json({

                message:
                    "Caterer email is required."

            });

        }


        const [rows] = await db.query(

            `SELECT

                er.request_id,

                er.customer_id,
                er.customer_name,

                er.phone,
                er.email,

                er.event_type,
                er.event_date,
                er.event_time,

                er.venue_location,
                er.guest_count,

                er.food_type,
                er.package_name,

                er.budget,
                er.catering_service,

                er.special_requirements,
                er.message,

                er.caterer_email,

                er.status,
                er.accepted_by,

                er.created_at

             FROM event_request er

             WHERE
                LOWER(er.caterer_email) = LOWER(?)

             AND
                er.status IN (
                    'accepted',
                    'payment_pending',
                    'confirmed'
                )

             ORDER BY
                er.event_date ASC,
                er.event_time ASC`,

            [catererEmail.trim()]

        );


        return res.status(200).json({

            events: rows

        });


    } catch (error) {

        console.error(

            "Get caterer events error:",
            error

        );

        return res.status(500).json({

            message:
                "Could not fetch caterer events."

        });

    }

}



// =====================================================
// UPDATE EVENT REQUEST STATUS
// =====================================================

async function updateRequestStatus(req, res) {

    try {

        const {
            id
        } = req.params;


        const {
            status,
            catererId
        } = req.body;


        // =================================================
        // VALIDATE STATUS
        // =================================================

        if (
            ![
                "accepted",
                "rejected"
            ].includes(status)
        ) {

            return res.status(400).json({

                message:
                    "Invalid status."

            });

        }


        // =================================================
        // CHECK REQUEST EXISTS
        // =================================================

        const [existingRows] = await db.query(

            `SELECT
                request_id,
                customer_id,
                caterer_email,
                budget,
                status

             FROM event_request

             WHERE request_id = ?`,

            [id]

        );


        if (existingRows.length === 0) {

            return res.status(404).json({

                message:
                    "Request not found."

            });

        }


        const request =
            existingRows[0];


        // =================================================
        // UPDATE REQUEST
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

                message:
                    "Request not found."

            });

        }



        // =================================================
        // IF CATERER ACCEPTS REQUEST
        // =================================================

        if (status === "accepted") {


            // =============================================
            // CREATE PAYMENT RECORD
            // =============================================

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


            // =============================================
            // CREATE EVENT TRACKING RECORD
            // =============================================

            await db.query(

                `INSERT INTO event_tracking
                (
                    request_id,
                    tracking_status
                )

                VALUES (?, 'caterer_accepted')`,

                [id]

            );


            // =============================================
            // PAYMENT PENDING
            // =============================================

            await db.query(

                `UPDATE event_request

                 SET status = 'payment_pending'

                 WHERE request_id = ?`,

                [id]

            );


            return res.status(200).json({

                message:
                    "Request accepted. Payment is now pending.",

                status:
                    "payment_pending"

            });

        }



        // =================================================
        // IF CATERER REJECTS REQUEST
        // =================================================

        return res.status(200).json({

            message:
                "Request rejected successfully.",

            status:
                "rejected"

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

    getCatererEvents,

    updateRequestStatus

};