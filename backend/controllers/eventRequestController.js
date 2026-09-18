const db = require("../config/db");

async function createRequest(req, res) {
    try {
        const {
            customerId,
            customerName,
            phone,
            email,
            eventDate,
            message
        } = req.body;

        if (!customerName || !phone || !email) {
            return res.status(400).json({
                message: "Name, phone and email are required."
            });
        }

        const [result] = await db.query(
            `INSERT INTO event_requests
            (customer_id, customer_name, phone, email, event_date, message)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                customerId || null,
                customerName,
                phone,
                email,
                eventDate || null,
                message || null
            ]
        );

        res.status(201).json({
            message: "Event request sent successfully!",
            requestId: result.insertId
        });

    } catch (error) {
        console.error("Create request error:", error);

        res.status(500).json({
            message: "Could not send event request."
        });
    }
}


async function getRequests(req, res) {
    try {
       const [rows] = await db.query(
    `SELECT 
        er.*,
        c.brand_name AS caterer_name
     FROM event_requests er
     LEFT JOIN caterers c
        ON er.accepted_by = c.caterer_id
     ORDER BY er.created_at DESC`
);

        res.status(200).json({
            requests: rows
        });

    } catch (error) {
        console.error("Get requests error:", error);

        res.status(500).json({
            message: "Could not fetch event requests."
        });
    }
}


async function updateRequestStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, catererId } = req.body;

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status."
            });
        }

        const [result] = await db.query(
            `UPDATE event_requests
             SET status = ?, accepted_by = ?
             WHERE request_id = ?`,
            [status, catererId || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Request not found."
            });
        }

        res.status(200).json({
            message: `Request ${status} successfully.`
        });

    } catch (error) {
        console.error("Update request error:", error);

        res.status(500).json({
            message: "Could not update request."
        });
    }
}


module.exports = {
    createRequest,
    getRequests,
    updateRequestStatus
};