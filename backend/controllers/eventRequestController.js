
const db = require("../config/db");

/* =========================================================
   CONVERT EVENT TIME TO MYSQL TIME FORMAT
========================================================= */
function convertEventTime(eventTime) {
    if (eventTime === undefined || eventTime === null || String(eventTime).trim() === "") {
        return null;
    }

    const time = String(eventTime).trim();

    // Supports 7:00 PM, 07:00 PM, and optional seconds
    const amPmMatch = time.match(
        /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i
    );

    if (amPmMatch) {
        let hours = Number(amPmMatch[1]);
        const minutes = Number(amPmMatch[2]);
        const seconds = Number(amPmMatch[3] || 0);
        const period = amPmMatch[4].toUpperCase();

        if (
            hours < 1 || hours > 12 ||
            minutes > 59 || seconds > 59
        ) {
            throw new Error("Invalid event time: " + time);
        }

        if (period === "PM" && hours !== 12) {
            hours += 12;
        } else if (period === "AM" && hours === 12) {
            hours = 0;
        }

        return (
            String(hours).padStart(2, "0") + ":" +
            String(minutes).padStart(2, "0") + ":" +
            String(seconds).padStart(2, "0")
        );
    }

    // Also supports 19:00 or 19:00:00
    const twentyFourHourMatch = time.match(
        /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
    );

    if (twentyFourHourMatch) {
        const hours = Number(twentyFourHourMatch[1]);
        const minutes = Number(twentyFourHourMatch[2]);
        const seconds = Number(twentyFourHourMatch[3] || 0);

        if (
            hours > 23 ||
            minutes > 59 ||
            seconds > 59
        ) {
            throw new Error("Invalid event time: " + time);
        }

        return (
            String(hours).padStart(2, "0") + ":" +
            String(minutes).padStart(2, "0") + ":" +
            String(seconds).padStart(2, "0")
        );
    }

    throw new Error("Invalid event time format: " + time);
}

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

        // Validate required fields
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

        // Validate and convert event time
        let formattedEventTime;

        try {
            formattedEventTime = convertEventTime(eventTime);
        } catch (timeError) {
            return res.status(400).json({
                message: timeError.message
            });
        }

        // If booking originated from an enquiry, verify ownership
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
                String(catererEmail).toLowerCase()
            ) {
                return res.status(403).json({
                    message: "This enquiry does not belong to this caterer."
                });
            }
        }

        // Create event request
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
                formattedEventTime,
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

        // Update enquiry after request creation
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
            req.params.customerId ||
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
   GET ALL OR CATERER REQUESTS
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

        query += " ORDER BY er.created_at DESC";

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
            req.params.email ||
            req.params.catererEmail ||
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
             AND er.status IN (
                'accepted',
                'payment_pending',
                'confirmed',
                'completed'
             )
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

        if (!id || !/^\d+$/.test(String(id))) {
            return res.status(400).json({
                message: "A valid request ID is required."
            });
        }

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be accepted or rejected."
            });
        }

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

        // Optional caterer ownership check
        if (catererId) {
            const [caterers] = await db.query(
                `SELECT caterer_id, email
                 FROM caterers
                 WHERE caterer_id = ?`,
                [catererId]
            );

            if (caterers.length === 0) {
                return res.status(404).json({
                    message: "Caterer not found."
                });
            }

            const caterer = caterers[0];

            if (
                !caterer.email ||
                !request.caterer_email ||
                caterer.email.toLowerCase() !==
                request.caterer_email.toLowerCase()
            ) {
                return res.status(403).json({
                    message: "This request does not belong to this caterer."
                });
            }
        }

        if (status === "rejected") {
            await db.query(
                `UPDATE event_request
                 SET status = 'rejected'
                 WHERE request_id = ?`,
                [id]
            );

            return res.status(200).json({
                message: "Event request rejected successfully.",
                requestId: Number(id),
                status: "rejected"
            });
        }

        // Accept request and move it to payment pending
        await db.query(
            `UPDATE event_request
             SET status = 'payment_pending'
             WHERE request_id = ?`,
            [id]
        );

        // Create payment record if the payment table is available
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

        // Create tracking record if the tracking table is available
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
