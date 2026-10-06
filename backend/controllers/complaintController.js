const db = require("../config/db");


// =====================================================
// CREATE CUSTOMER COMPLAINT
// =====================================================

const createComplaint = async (req, res) => {

    try {

        const {
            customerId,
            customerName,
            customerEmail,
            complaintCategory,
            catererName,
            complaintSubject,
            complaintDescription
        } = req.body;


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (
            !customerName ||
            !customerEmail ||
            !complaintCategory ||
            !complaintSubject ||
            !complaintDescription
        ) {

            return res.status(400).json({
                message: "Please fill all required complaint fields."
            });

        }


        // -------------------------------------------------
        // INSERT COMPLAINT
        // -------------------------------------------------

        const [result] = await db.query(
            `
            INSERT INTO complaints
            (
                customer_id,
                customer_name,
                customer_email,
                complaint_category,
                caterer_name,
                complaint_subject,
                complaint_description
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                customerId || null,
                customerName,
                customerEmail,
                complaintCategory,
                catererName || null,
                complaintSubject,
                complaintDescription
            ]
        );


        // -------------------------------------------------
        // SUCCESS RESPONSE
        // -------------------------------------------------

        return res.status(201).json({

            message: "Complaint submitted successfully.",

            complaintId: result.insertId

        });


    } catch (error) {

        console.error(
            "Create complaint error:",
            error
        );

        return res.status(500).json({

            message: "Failed to submit complaint."

        });

    }

};


// =====================================================
// GET ALL COMPLAINTS FOR ADMIN
// =====================================================

const getAllComplaints = async (req, res) => {

    try {

        const [complaints] = await db.query(
            `
            SELECT
                complaint_id,
                customer_id,
                customer_name,
                customer_email,
                complaint_category,
                caterer_name,
                complaint_subject,
                complaint_description,
                priority,
                status,
                admin_reply,
                created_at,
                updated_at
            FROM complaints
            ORDER BY created_at DESC
            `
        );


        return res.status(200).json({

            complaints: complaints

        });


    } catch (error) {

        console.error(
            "Get complaints error:",
            error
        );

        return res.status(500).json({

            message: "Failed to load complaints."

        });

    }

};


// =====================================================
// GET SINGLE COMPLAINT
// =====================================================

const getComplaintById = async (req, res) => {

    try {

        const complaintId = req.params.id;


        const [complaints] = await db.query(
            `
            SELECT
                complaint_id,
                customer_id,
                customer_name,
                customer_email,
                complaint_category,
                caterer_name,
                complaint_subject,
                complaint_description,
                priority,
                status,
                admin_reply,
                created_at,
                updated_at
            FROM complaints
            WHERE complaint_id = ?
            `,
            [complaintId]
        );


        if (complaints.length === 0) {

            return res.status(404).json({

                message: "Complaint not found."

            });

        }


        return res.status(200).json({

            complaint: complaints[0]

        });


    } catch (error) {

        console.error(
            "Get complaint details error:",
            error
        );

        return res.status(500).json({

            message: "Failed to load complaint."

        });

    }

};


// =====================================================
// UPDATE COMPLAINT STATUS
// =====================================================

const updateComplaintStatus = async (req, res) => {

    try {

        const complaintId = req.params.id;

        const {
            status
        } = req.body;


        const allowedStatuses = [
            "open",
            "in_progress",
            "resolved"
        ];


        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({

                message: "Invalid complaint status."

            });

        }


        const [result] = await db.query(
            `
            UPDATE complaints
            SET status = ?
            WHERE complaint_id = ?
            `,
            [
                status,
                complaintId
            ]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                message: "Complaint not found."

            });

        }


        return res.status(200).json({

            message: "Complaint status updated successfully."

        });


    } catch (error) {

        console.error(
            "Update complaint status error:",
            error
        );

        return res.status(500).json({

            message: "Failed to update complaint status."

        });

    }

};


// =====================================================
// UPDATE COMPLAINT PRIORITY
// =====================================================

const updateComplaintPriority = async (req, res) => {

    try {

        const complaintId = req.params.id;

        const {
            priority
        } = req.body;


        const allowedPriorities = [
            "normal",
            "high",
            "urgent"
        ];


        if (!allowedPriorities.includes(priority)) {

            return res.status(400).json({

                message: "Invalid complaint priority."

            });

        }


        const [result] = await db.query(
            `
            UPDATE complaints
            SET priority = ?
            WHERE complaint_id = ?
            `,
            [
                priority,
                complaintId
            ]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                message: "Complaint not found."

            });

        }


        return res.status(200).json({

            message: "Complaint priority updated successfully."

        });

    } catch (error) {

        console.error(
            "Update complaint priority error:",
            error
        );

        return res.status(500).json({

            message: "Failed to update complaint priority."

        });

    }

};


// =====================================================
// ADMIN REPLY TO COMPLAINT
// =====================================================

const replyToComplaint = async (req, res) => {

    try {

        const complaintId = req.params.id;

        const {
            adminReply
        } = req.body;


        if (!adminReply || !adminReply.trim()) {

            return res.status(400).json({

                message: "Admin reply cannot be empty."

            });

        }


        const [result] = await db.query(
            `
            UPDATE complaints
            SET
                admin_reply = ?,
                status = 'in_progress'
            WHERE complaint_id = ?
            `,
            [
                adminReply.trim(),
                complaintId
            ]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                message: "Complaint not found."

            });

        }


        return res.status(200).json({

            message: "Admin reply saved successfully."

        });


    } catch (error) {

        console.error(
            "Reply to complaint error:",
            error
        );

        return res.status(500).json({

            message: "Failed to save admin reply."

        });

    }

};


module.exports = {

    createComplaint,
    getAllComplaints,
    getComplaintById,
    updateComplaintStatus,
    updateComplaintPriority,
    replyToComplaint

};