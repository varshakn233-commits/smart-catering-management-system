const db = require("../config/db");

/* =====================================================
   CUSTOMER - SEND ENQUIRY
===================================================== */

async function createEnquiry(req, res) {
    try {
        const {
            customerId,
            customerName,
            customerPhone,
            customerEmail,

            catererId,
            catererName,
            catererEmail,

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
            message
        } = req.body;

        if (
            !customerName ||
            !customerPhone ||
            !customerEmail ||
            !catererName ||
            !catererEmail ||
            !eventType ||
            !eventDate ||
            !eventTime ||
            !venueLocation ||
            !guestCount ||
            !foodType
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required enquiry fields."
            });
        }

        const [result] = await db.query(
            `INSERT INTO customer_enquiries
            (
                customer_id,
                customer_name,
                customer_phone,
                customer_email,
                caterer_id,
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
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'enquiry_sent')`,
            [
                customerId || null,
                customerName,
                customerPhone,
                customerEmail,

                catererId || null,
                catererName,
                catererEmail,

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
                message || null
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Enquiry sent successfully.",
            enquiryId: result.insertId
        });

    } catch (error) {
        console.error("Create enquiry error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not send enquiry."
        });
    }
}


/* =====================================================
   CUSTOMER - GET THEIR ENQUIRIES
===================================================== */

async function getCustomerEnquiries(req, res) {
    try {
        const { customerId } = req.params;

        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: "Customer ID is required."
            });
        }

        const [rows] = await db.query(
            `SELECT
                enquiry_id,
                customer_id,
                customer_name,
                customer_phone,
                customer_email,
                caterer_id,
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
             WHERE customer_id = ?
             ORDER BY created_at DESC`,
            [customerId]
        );

        return res.status(200).json({
            success: true,
            enquiries: rows
        });

    } catch (error) {
        console.error("Get customer enquiries error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch enquiries."
        });
    }
}


/* =====================================================
   CATERER - GET CUSTOMER ENQUIRIES
===================================================== */

async function getCatererEnquiries(req, res) {
    try {
        const catererEmail =
            req.query.catererEmail ||
            req.query.email ||
            req.params.catererEmail;

        if (!catererEmail) {
            return res.status(400).json({
                success: false,
                message: "Caterer email is required."
            });
        }

        const [rows] = await db.query(
            `SELECT
                enquiry_id,
                customer_id,
                customer_name,
                customer_phone,
                customer_email,
                caterer_id,
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
             WHERE LOWER(caterer_email) = LOWER(?)
             ORDER BY created_at DESC`,
            [catererEmail.trim()]
        );

        return res.status(200).json({
            success: true,
            enquiries: rows
        });

    } catch (error) {
        console.error("Get caterer enquiries error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch customer enquiries."
        });
    }
}


/* =====================================================
   CATERER - REPLY TO ENQUIRY
===================================================== */

async function replyToEnquiry(req, res) {
    try {
        const { id } = req.params;
        const { catererReply, catererEmail } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Enquiry ID is required."
            });
        }

        if (!catererReply || !catererReply.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter a reply."
            });
        }

        const [existingRows] = await db.query(
            `SELECT
                enquiry_id,
                caterer_email,
                status
             FROM customer_enquiries
             WHERE enquiry_id = ?`,
            [id]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found."
            });
        }

        const enquiry = existingRows[0];

        if (
            catererEmail &&
            enquiry.caterer_email.toLowerCase() !==
            catererEmail.trim().toLowerCase()
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot reply to this enquiry."
            });
        }

        await db.query(
            `UPDATE customer_enquiries
             SET
                caterer_reply = ?,
                status = 'caterer_responded',
                replied_at = CURRENT_TIMESTAMP
             WHERE enquiry_id = ?`,
            [
                catererReply.trim(),
                id
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Reply sent successfully.",
            enquiryId: Number(id),
            status: "caterer_responded"
        });

    } catch (error) {
        console.error("Reply to enquiry error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not send enquiry reply."
        });
    }
}


/* =====================================================
   MARK ENQUIRY AS BOOKING CREATED
===================================================== */

async function markEnquiryBookingCreated(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Enquiry ID is required."
            });
        }

        const [result] = await db.query(
            `UPDATE customer_enquiries
             SET status = 'booking_created'
             WHERE enquiry_id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Enquiry marked as booking created.",
            status: "booking_created"
        });

    } catch (error) {
        console.error(
            "Mark enquiry booking created error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Could not update enquiry."
        });
    }
}


module.exports = {
    createEnquiry,
    getCustomerEnquiries,
    getCatererEnquiries,
    replyToEnquiry,
    markEnquiryBookingCreated
};