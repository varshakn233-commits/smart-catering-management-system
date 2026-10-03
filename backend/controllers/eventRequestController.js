const db = require("../config/db");

/* =========================================================
   CREATE EVENT REQUEST
========================================================= */
async function createRequest(req, res) {
    try {
        const {
            enquiryId,
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
            !customerId ||
            !customerName ||
            !phone ||
            !email ||
            !eventType ||
            !eventDate ||
            !venueLocation ||
            !guestCount ||
            !catererEmail
        ) {
            return res.status(400).json({
                message: "Please fill all required fields."
            });
        }

        /* -------------------------------------------------
           If request came from a customer enquiry,
           verify that the enquiry exists and belongs
           to the customer + caterer.
        ------------------------------------------------- */
        if (enquiryId) {
            const [enquiries] = await db.query(
                `SELECT enquiry_id, customer_id, caterer_email, status
                 FROM customer_enquiries
                 WHERE enquiry_id = ?`,
                [enquiryId]
            );

            if (enquiries.length === 0) {
                return res.status(404).json({
                    message: "Enquiry not found."
                });
            }

            const enquiry = enquiries[0];

            if (String(enquiry.customer_id) !== String(customerId)) {
                return res.status(403).json({
                    message: "This enquiry does not belong to this customer."
                });
            }

            if (
                enquiry.caterer_email &&
                enquiry.caterer_email.toLowerCase() !==
                    catererEmail.toLowerCase()
            ) {
                return res.status(403).json({
                    message: "This enquiry does not belong to this caterer."
                });
            }
        }

        /* -------------------------------------------------
           IMPORTANT:
           event_request DOES NOT have enquiry_id.
           So do NOT insert enquiry_id here.
        ------------------------------------------------- */

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
                customerId,
                customerName,
                phone,
                email,
                eventType,
                eventDate,
                eventTime || null,
                venueLocation,
                guestCount,
                foodType || null,
                packageName || null,
                budget || null,
                cateringService || null,
                specialRequirements || null,
                message || null,
                catererEmail
            ]
        );

        /* -------------------------------------------------
           Mark enquiry as booking_created
           AFTER event request is successfully created.
        ------------------------------------------------- */
        if (enquiryId) {
            try {
                await db.query(
                    `UPDATE customer_enquiries
                     SET status = 'booking_created'
                     WHERE enquiry_id = ?`,
                    [enquiryId]
                );
            } catch (error) {
                console.error(
                    "Could not update enquiry status:",
                    error.message
                );
            }
        }

        return res.status(201).json({
            message: "Event request created successfully.",
            requestId: result.insertId,
            enquiryId: enquiryId || null
        });

    } catch (error) {
        console.error("Create request error:", error);

        return res.status(500).json({
            message: "Could not create event request.",
            error: error.message
        });
    }
}


/* =========================================================
   GET CUSTOMER REQUESTS
========================================================= */
async function getCustomerRequests(req, res) {
    try {
        const customerId =
            req.query.customerId ||
            req.user?.customerId ||
            req.user?.id;

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
                er.created_at,
                c.brand_name
             FROM event_request er
             LEFT JOIN caterers c
                ON LOWER(c.email) = LOWER(er.caterer_email)
             WHERE er.customer_id = ?
             ORDER BY er.created_at DESC`,
            [customerId]
        );

        return res.status(200).json({
            requests: rows
        });

    } catch (error) {
        console.error("Get customer requests error:", error);

        return res.status(500).json({
            message: "Could not fetch customer requests.",
            error: error.message
        });
    }
}


/* =========================================================
   GET ALL / CATERER REQUESTS
========================================================= */
async function getRequests(req, res) {
    try {
        const catererEmail =
            req.query.catererEmail ||
            req.query.email ||
            req.user?.email;

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
                er.created_at
            FROM event_request er
        `;

        const params = [];

        if (catererEmail) {
            query += `
                WHERE LOWER(er.caterer_email) = LOWER(?)
            `;

            params.push(catererEmail);
        }

        query += `
            ORDER BY er.created_at DESC
        `;

        const [rows] = await db.query(query, params);

        return res.status(200).json({
            requests: rows
        });

    } catch (error) {
        console.error("Get requests error:", error);

        return res.status(500).json({
            message: "Could not fetch event requests.",
            error: error.message
        });
    }
}


/* =========================================================
   GET CATERER EVENTS
========================================================= */
async function getCatererEvents(req, res) {
    try {
        const catererEmail =
            req.query.catererEmail ||
            req.query.email ||
            req.user?.email;

        if (!catererEmail) {
            return res.status(400).json({
                message: "Caterer email is required."
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
                er.created_at
             FROM event_request er
             WHERE LOWER(er.caterer_email) = LOWER(?)
             AND er.status IN ('accepted', 'payment_pending', 'confirmed', 'completed')
             ORDER BY er.event_date ASC, er.created_at DESC`,
            [catererEmail]
        );

        return res.status(200).json({
            events: rows
        });

    } catch (error) {
        console.error("Get caterer events error:", error);

        return res.status(500).json({
            message: "Could not fetch caterer events.",
            error: error.message
        });
    }
}


/* =========================================================
   UPDATE REQUEST STATUS
========================================================= */
async function updateRequestStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, catererId } = req.body;

        if (!id) {
            return res.status(400).json({
                message: "Request ID is required."
            });
        }

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be accepted or rejected."
            });
        }

        /* -------------------------------------------------
           Get request
           IMPORTANT:
           No enquiry_id here because event_request
           does not contain that column.
        ------------------------------------------------- */
        const [requests] = await db.query(
            `SELECT
                request_id,
                customer_id,
                customer_name,
                phone,
                email,
                caterer_email,
                budget,
                status
             FROM event_request
             WHERE request_id = ?`,
            [id]
        );

        if (requests.length === 0) {
            return res.status(404).json({
                message: "Event request not found."
            });
        }

        const request = requests[0];

        /* -------------------------------------------------
           Optional caterer ownership verification
        ------------------------------------------------- */
        if (catererId) {
            try {
                const [caterers] = await db.query(
                    `SELECT caterer_id, email
                     FROM caterers
                     WHERE caterer_id = ?`,
                    [catererId]
                );

                if (caterers.length > 0) {
                    const caterer = caterers[0];

                    if (
                        caterer.email &&
                        request.caterer_email &&
                        caterer.email.toLowerCase() !==
                            request.caterer_email.toLowerCase()
                    ) {
                        return res.status(403).json({
                            message: "This request does not belong to this caterer."
                        });
                    }
                }
            } catch (error) {
                console.error(
                    "Caterer ownership check failed:",
                    error.message
                );
            }
        }

        /* -------------------------------------------------
           REJECT
        ------------------------------------------------- */
        if (status === "rejected") {
            await db.query(
                `UPDATE event_request
                 SET status = 'rejected'
                 WHERE request_id = ?`,
                [id]
            );

            return res.status(200).json({
                message: "Event request rejected successfully."
            });
        }

        /* -------------------------------------------------
           ACCEPT
           Move request to payment_pending.
        ------------------------------------------------- */
        await db.query(
            `UPDATE event_request
             SET status = 'payment_pending'
             WHERE request_id = ?`,
            [id]
        );


        /* =================================================
           CREATE PAYMENT RECORD
           This is wrapped in try/catch so that an issue
           with the optional payment table does not stop
           the request from being accepted.
        ================================================= */
        try {
            await db.query(
                `INSERT INTO event_payments
                (
                    request_id,
                    customer_id,
                    amount,
                    status
                )
                VALUES (?, ?, ?, 'pending')`,
                [
                    request.request_id,
                    request.customer_id,
                    request.budget || 0
                ]
            );
        } catch (paymentError) {
            console.error(
                "Payment record could not be created:",
                paymentError.message
            );
        }


        /* =================================================
           CREATE TRACKING RECORD
        ================================================= */
        try {
            await db.query(
                `INSERT INTO event_tracking
                (
                    request_id,
                    status
                )
                VALUES (?, 'accepted')`,
                [request.request_id]
            );
        } catch (trackingError) {
            console.error(
                "Tracking record could not be created:",
                trackingError.message
            );
        }

        return res.status(200).json({
            message: "Event request accepted successfully.",
            requestId: request.request_id,
            status: "payment_pending",
            enquiryId: null
        });

    } catch (error) {
        console.error("Update request status error:", error);

        return res.status(500).json({
            message: "Could not update request status.",
            error: error.message
        });
    }
}


/* =========================================================
   EXPORT FUNCTIONS
========================================================= */

module.exports = {
    createRequest,
    getCustomerRequests,
    getRequests,
    getCatererEvents,
    updateRequestStatus
};