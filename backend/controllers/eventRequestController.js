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
        // VALIDATE REQUIRED FIELDS
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
                success: false,
                message: "Please fill all required fields."
            });

        }


        // =================================================
        // INSERT EVENT REQUEST
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

            success: true,

            message: "Event request sent successfully!",

            requestId: result.insertId

        });


    } catch (error) {

        console.error(
            "Create request error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Could not send event request."

        });

    }

}



// =====================================================
// GET CUSTOMER'S EVENT REQUESTS
// =====================================================

async function getCustomerRequests(req, res) {

    try {

        const {
            customerId
        } = req.params;


        if (!customerId) {

            return res.status(400).json({

                success: false,

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

            success: true,

            requests: rows

        });


    } catch (error) {

        console.error(
            "Get customer requests error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Could not fetch customer requests."

        });

    }

}



// =====================================================
// GET CATERER EVENT REQUESTS
//
// Supports:
// /api/requests/caterer?email=...
// /api/requests/caterer?catererEmail=...
// /api/requests/caterer/:catererEmail
// =====================================================

async function getRequests(req, res) {

    try {

        const catererEmail =
            req.query.catererEmail ||
            req.query.email ||
            req.params.catererEmail;


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
        // FILTER BY CATERER EMAIL
        // =================================================

        if (catererEmail) {

            query += `

                WHERE LOWER(er.caterer_email)
                = LOWER(?)

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

            success: true,

            requests: rows

        });


    } catch (error) {

        console.error(
            "Get event requests error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Could not fetch event requests."

        });

    }

}



// =====================================================
// GET CATERER'S EVENTS
//
// Accepted requests become payment_pending.
// After payment they become confirmed.
// =====================================================

async function getCatererEvents(req, res) {

    try {

        /*
         * Caterer email can come from:
         *
         * req.query.catererEmail
         * req.query.email
         * req.params.catererEmail
         */

        const catererEmail =
            req.query.catererEmail ||
            req.query.email ||
            req.params.catererEmail;


        if (!catererEmail) {

            return res.status(400).json({

                success: false,

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
                LOWER(er.caterer_email)
                = LOWER(?)

             AND er.status IN
                (
                    'accepted',
                    'payment_pending',
                    'confirmed'
                )

             ORDER BY
                er.event_date ASC,
                er.event_time ASC`,

            [
                catererEmail.trim()
            ]

        );


        return res.status(200).json({

            success: true,

            events: rows

        });


    } catch (error) {

        console.error(
            "Get caterer events error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Could not fetch caterer events."

        });

    }

}



// =====================================================
// ACCEPT / REJECT EVENT REQUEST
// =====================================================

async function updateRequestStatus(req, res) {

    try {

        const {
            id
        } = req.params;


        const {
            status,
            catererId,
            catererEmail
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

                success: false,

                message:
                    "Invalid status."

            });

        }


        // =================================================
        // CHECK REQUEST EXISTS
        // =================================================

        const [existingRows] =
            await db.query(

                `SELECT

                    request_id,
                    customer_id,
                    customer_name,

                    caterer_email,
                    budget,

                    status

                 FROM event_request

                 WHERE request_id = ?`,

                [id]

            );


        if (
            existingRows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Request not found."

            });

        }


        const request =
            existingRows[0];


        // =================================================
        // PREVENT REPEATED ACCEPTANCE
        // =================================================

        if (
            request.status ===
                "payment_pending" ||
            request.status ===
                "confirmed"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This request has already been accepted."

            });

        }


        // =================================================
        // REJECT REQUEST
        // =================================================

        if (status === "rejected") {

            await db.query(

                `UPDATE event_request

                 SET
                    status = 'rejected',
                    accepted_by = ?

                 WHERE request_id = ?`,

                [
                    catererId ||
                    catererEmail ||
                    request.caterer_email ||
                    null,

                    id
                ]

            );


            return res.status(200).json({

                success: true,

                message:
                    "Request rejected successfully.",

                status:
                    "rejected"

            });

        }


        // =================================================
        // ACCEPT REQUEST
        // =================================================

        await db.query(

            `UPDATE event_request

             SET
                status = 'payment_pending',
                accepted_by = ?

             WHERE request_id = ?`,

            [

                catererId ||
                catererEmail ||
                request.caterer_email ||
                null,

                id

            ]

        );


        // =================================================
        // CREATE PAYMENT RECORD
        // =================================================

        try {

            await db.query(

                `INSERT INTO event_payments
                (
                    request_id,
                    customer_id,
                    amount,
                    payment_status
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    'pending'
                )`,

                [

                    id,

                    request.customer_id,

                    request.budget || 0

                ]

            );

        } catch (paymentError) {

            /*
             * If a payment record already exists,
             * do not crash the whole Accept operation.
             */

            console.error(
                "Payment record error:",
                paymentError
            );

        }


        // =================================================
        // CREATE EVENT TRACKING RECORD
        // =================================================

        try {

            await db.query(

                `INSERT INTO event_tracking
                (
                    request_id,
                    tracking_status
                )
                VALUES
                (
                    ?,
                    'caterer_accepted'
                )`,

                [id]

            );

        } catch (trackingError) {

            /*
             * Tracking failure should not undo
             * the successful acceptance.
             */

            console.error(
                "Tracking record error:",
                trackingError
            );

        }


        // =================================================
        // FINAL SUCCESS RESPONSE
        // =================================================

        return res.status(200).json({

            success: true,

            message:
                "Request accepted. Payment is now pending.",

            requestId:
                Number(id),

            status:
                "payment_pending"

        });


    } catch (error) {

        console.error(
            "Update request error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Could not update event request.",

            error:
                error.message

        });

    }

}



// =====================================================
// EXPORT
// =====================================================

module.exports = {

    createRequest,

    getCustomerRequests,

    getRequests,

    getCatererEvents,

    updateRequestStatus

};