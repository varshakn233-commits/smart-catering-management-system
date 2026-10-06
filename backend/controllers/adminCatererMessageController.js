const db = require("../config/db");


// =====================================================
// SEND MESSAGE FROM ADMIN TO CATERER
// =====================================================

const sendAdminMessageToCaterer = async (req, res) => {

    try {

        const {
            catererId,
            catererName,
            complaintId,
            subject,
            message
        } = req.body;


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (
            !catererName ||
            !subject ||
            !message
        ) {

            return res.status(400).json({
                message:
                    "Caterer name, subject and message are required."
            });

        }


        // -------------------------------------------------
        // ADMIN ID
        // -------------------------------------------------

        const adminId =
            req.admin?.adminId ||
            null;


        // -------------------------------------------------
        // INSERT MESSAGE
        // -------------------------------------------------

        const [result] = await db.query(
            `
            INSERT INTO admin_caterer_messages
            (
                caterer_id,
                caterer_name,
                complaint_id,
                admin_id,
                subject,
                message
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                catererId || null,
                catererName,
                complaintId || null,
                adminId,
                subject,
                message
            ]
        );


        return res.status(201).json({

            message:
                "Message sent to caterer successfully.",

            messageId:
                result.insertId

        });

    }

    catch (error) {

        console.error(
            "Send admin caterer message error:",
            error
        );

        return res.status(500).json({

            message:
                "Failed to send message to caterer."

        });

    }

};



// =====================================================
// GET CATERER MESSAGES
// =====================================================

const getCatererMessages = async (req, res) => {

    try {

        const catererId =
            req.params.catererId;


        const [messages] = await db.query(
            `
            SELECT
                message_id,
                caterer_id,
                caterer_name,
                complaint_id,
                admin_id,
                subject,
                message,
                status,
                created_at,
                updated_at

            FROM admin_caterer_messages

            WHERE caterer_id = ?

            ORDER BY created_at DESC
            `,
            [
                catererId
            ]
        );


        return res.status(200).json({

            messages:
                messages

        });

    }

    catch (error) {

        console.error(
            "Get caterer messages error:",
            error
        );

        return res.status(500).json({

            message:
                "Failed to load caterer messages."

        });

    }

};



// =====================================================
// MARK MESSAGE AS READ
// =====================================================

const markMessageAsRead = async (req, res) => {

    try {

        const messageId =
            req.params.id;


        const [result] = await db.query(
            `
            UPDATE admin_caterer_messages

            SET status = 'read'

            WHERE message_id = ?
            `,
            [
                messageId
            ]
        );


        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                message:
                    "Message not found."

            });

        }


        return res.status(200).json({

            message:
                "Message marked as read."

        });

    }

    catch (error) {

        console.error(
            "Mark caterer message as read error:",
            error
        );

        return res.status(500).json({

            message:
                "Failed to update message."

        });

    }

};



// =====================================================
// EXPORT
// =====================================================

module.exports = {

    sendAdminMessageToCaterer,

    getCatererMessages,

    markMessageAsRead

};