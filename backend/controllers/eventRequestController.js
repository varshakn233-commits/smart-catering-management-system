
const db = require("../config/db");

/* =========================================================
   CONVERT EVENT TIME TO MYSQL TIME FORMAT
========================================================= */
function convertEventTime(eventTime) {
    if (
        eventTime === undefined ||
        eventTime === null ||
        String(eventTime).trim() === ""
    ) {
        return null;
    }

    const time = String(eventTime).trim();

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

        if (
            !customerId ||
            !customerName ||
            !phone ||
            !email ||
            !eventType ||
            !eventDate ||
            !eventTime ||
            !venueLocation ||
            !guestCount ||
            !catererEmail
        ) {
            return res.status(400).json({
                message: "Please fill all required fields."
            });
        }

        const parsedCustomerId = Number(customerId);

        if (
            !Number.isInteger(parsedCustomerId) ||
            parsedCustomerId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid customer ID."
            });
        }

        const parsedEnquiryId =
            enquiryId !== undefined &&
            enquiryId !== null &&
            String(enquiryId).trim() !== ""
                ? Number(enquiryId)
                : null;

        if (
            parsedEnquiryId !== null &&
            (
                !Number.isInteger(parsedEnquiryId) ||
                parsedEnquiryId <= 0
            )
        ) {
            return res.status(400).json({
                message: "Invalid enquiry ID."
            });
        }

        let formattedEventTime;

        try {
            formattedEventTime = convertEventTime(eventTime);
        } catch (timeError) {
            return res.status(400).json({
                message: timeError.message
            });
        }

        // Verify the original enquiry belongs to this customer
        // and caterer before linking the booking.
        if (parsedEnquiryId !== null) {
            const [enquiries] = await db.query(
                `SELECT
                    enquiry_id,
                    customer_id,
                    caterer_email,
                    status
                 FROM customer_enquiries
                 WHERE enquiry_id = ?`,
                [parsedEnquiryId]
            );

            if (enquiries.length === 0) {
                return res.status(404).json({
                    message: "Enquiry not found."
                });
            }

            const enquiry = enquiries[0];

            if (
                String(enquiry.customer_id) !==
                String(parsedCustomerId)
            ) {
                return res.status(403).json({
                    message:
                        "This enquiry does not belong to this customer."
                });
            }

            if (
                !enquiry.caterer_email ||
                enquiry.caterer_email.trim().toLowerCase() !==
                String(catererEmail).trim().toLowerCase()
            ) {
                return res.status(403).json({
                    message:
                        "This enquiry does not belong to this caterer."
                });
            }

            // Prevent a second booking for the same enquiry.
            const [existingBookings] = await db.query(
                `SELECT request_id, enquiry_id, status
                 FROM event_request
                 WHERE enquiry_id = ?
                 LIMIT 1`,
                [parsedEnquiryId]
            );

            if (existingBookings.length > 0) {
                return res.status(200).json({
                    message: "A booking already exists for this enquiry.",
                    requestId: existingBookings[0].request_id,
                    enquiryId: existingBookings[0].enquiry_id,
                    status: existingBookings[0].status,
                    alreadyExists: true
                });
            }
        }

        // Create a booking linked to its original enquiry.
        const [result] = await db.query(
            `INSERT INTO event_request
            (
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
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                parsedEnquiryId,
                parsedCustomerId,
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

        if (parsedEnquiryId !== null) {
            await db.query(
                `UPDATE customer_enquiries
                 SET status = 'booking_created'
                 WHERE enquiry_id = ?`,
                [parsedEnquiryId]
            );
        }

        return res.status(201).json({
            message: "Event request created successfully.",
            requestId: result.insertId,
            enquiryId: parsedEnquiryId,
            status: "pending"
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
                er.enquiry_id,
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
                er.enquiry_id,
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
                er.enquiry_id,
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
             WHERE LOWER(TRIM(er.caterer_email)) = LOWER(TRIM(?))
               AND er.event_date >= CURDATE()
               AND er.status IN (
                   'accepted',
                   'payment_pending',
                   'confirmed',
                   'preparing',
                   'on_the_way',
                   'event_started'
               )
             ORDER BY er.event_date ASC, er.event_time ASC`,
            [catererEmail.trim()]
        );

        return res.status(200).json({
            events: rows
        });

    } catch (error) {
        console.error("Get caterer events error:", error);

        return res.status(500).json({
            message: "Could not fetch caterer events."
        });
    }
}

/* =========================================================
   UPDATE REQUEST STATUS
========================================================= */
async function updateRequestStatus(req, res) {
    const connection = await db.getConnection();

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

        await connection.beginTransaction();

        // Get and lock the booking.
        const [requests] = await connection.query(
            `SELECT
                request_id,
                enquiry_id,
                customer_id,
                customer_name,
                phone,
                email,
                caterer_email,
                budget,
                status
             FROM event_request
             WHERE request_id = ?
             FOR UPDATE`,
            [id]
        );

        if (requests.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Event request not found."
            });
        }

        const request = requests[0];

        // Verify caterer ownership when catererId is provided.
        if (catererId) {
            const [caterers] = await connection.query(
                `SELECT caterer_id, email
                 FROM caterers
                 WHERE caterer_id = ?`,
                [catererId]
            );

            if (caterers.length === 0) {
                await connection.rollback();

                return res.status(404).json({
                    message: "Caterer not found."
                });
            }

            const caterer = caterers[0];

            if (
                !caterer.email ||
                !request.caterer_email ||
                caterer.email.trim().toLowerCase() !==
                    request.caterer_email.trim().toLowerCase()
            ) {
                await connection.rollback();

                return res.status(403).json({
                    message: "This request does not belong to this caterer."
                });
            }
        }

        // Only new pending bookings can be accepted or rejected.
        if (request.status !== "pending") {
            await connection.rollback();

            return res.status(400).json({
                message:
                    `This booking is already ${request.status} and cannot be accepted or rejected again.`,
                currentStatus: request.status
            });
        }

        // Reject the booking.
        if (status === "rejected") {
            await connection.query(
                `UPDATE event_request
                 SET status = 'rejected'
                 WHERE request_id = ?`,
                [id]
            );

            await connection.commit();

            return res.status(200).json({
                message: "Event request rejected successfully.",
                requestId: request.request_id,
                enquiryId: request.enquiry_id || null,
                status: "rejected"
            });
        }

        // Before acceptance, check for any existing payment.
        const [payments] = await connection.query(
            `SELECT payment_id, payment_status
             FROM event_payments
             WHERE request_id = ?
             ORDER BY payment_id DESC
             LIMIT 1
             FOR UPDATE`,
            [request.request_id]
        );

        // A previous paid or refunded payment must not be reused.
        if (
            payments.length > 0 &&
            ["paid", "refunded"].includes(payments[0].payment_status)
        ) {
            await connection.rollback();

            return res.status(409).json({
                message:
                    "This booking has an existing paid or refunded payment and needs review.",
                paymentStatus: payments[0].payment_status
            });
        }

        // Accept the booking and move it to payment_pending.
        await connection.query(
            `UPDATE event_request
             SET status = 'payment_pending'
             WHERE request_id = ?`,
            [id]
        );

        // Create a payment record if one does not already exist.
        if (payments.length === 0) {
            await connection.query(
                `INSERT INTO event_payments
                (
                    request_id,
                    customer_id,
                    amount,
                    payment_status
                )
                VALUES (?, ?, ?, 'pending')`,
                [
                    request.request_id,
                    request.customer_id,
                    request.budget || 0
                ]
            );
        } else {
            // Allow a failed payment to be retried.
            if (payments[0].payment_status === "failed") {
                await connection.query(
                    `UPDATE event_payments
                     SET payment_status = 'pending',
                         failed_at = NULL
                     WHERE payment_id = ?`,
                    [payments[0].payment_id]
                );
            }
        }

        // Create tracking if no record exists.
        const [tracking] = await connection.query(
            `SELECT tracking_id
             FROM event_tracking
             WHERE request_id = ?
             LIMIT 1`,
            [request.request_id]
        );

        if (tracking.length === 0) {
            await connection.query(
                `INSERT INTO event_tracking
                (
                    request_id,
                    tracking_status
                )
                VALUES (?, 'accepted')`,
                [request.request_id]
            );
        }

        await connection.commit();

        return res.status(200).json({
            message: "Event request accepted successfully.",
            requestId: request.request_id,
            enquiryId: request.enquiry_id || null,
            status: "payment_pending"
        });

    } catch (error) {
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error("Rollback error:", rollbackError);
        }

        console.error("Update request status error:", error);

        return res.status(500).json({
            message: "Could not update request status."
        });

    } finally {
        connection.release();
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
