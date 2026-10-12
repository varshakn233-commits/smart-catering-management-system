const db = require("../config/db");
const nodemailer = require("nodemailer");

// =====================================================
// EMAIL CONFIGURATION
// =====================================================

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

// =====================================================
// CREATE CONTACT MESSAGE
// Visitor → Admin
// =====================================================

const createContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                message: "Please fill in all contact form fields."
            });
        }

        const cleanName = String(name).trim();
        const cleanEmail = String(email).trim();
        const cleanSubject = String(subject).trim();
        const cleanMessage = String(message).trim();

        // Validate email address
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        if (!cleanName || !cleanSubject || !cleanMessage) {
            return res.status(400).json({
                message: "Name, subject and message cannot be empty."
            });
        }

        /*
         * Your current database table does not contain
         * name or subject columns.
         *
         * It uses:
         * customer_name, phone, email, event_date,
         * message, status, admin_reply, replied_at,
         * created_at.
         *
         * Since this contact form does not collect phone
         * or event_date, use safe defaults for those fields.
         */

        const [result] = await db.query(
            `INSERT INTO contact_messages
                (
                    customer_name,
                    phone,
                    email,
                    event_date,
                    message,
                    status,
                    created_at
                )
             VALUES (?, ?, ?, NULL, ?, 'new', NOW())`,
            [
                cleanName,
                "Not provided",
                cleanEmail,
                `Subject: ${cleanSubject}\n\n${cleanMessage}`
            ]
        );

        // Notify admin by email
        try {
            if (
                process.env.MAIL_USER &&
                process.env.MAIL_PASS &&
                process.env.ADMIN_EMAIL
            ) {
                await transporter.sendMail({
                    from: process.env.MAIL_USER,
                    to: process.env.ADMIN_EMAIL,
                    replyTo: cleanEmail,
                    subject: `New Contact Message: ${cleanSubject}`,
                    text:
                        `A visitor has contacted Annapriya.\n\n` +
                        `Name: ${cleanName}\n` +
                        `Email: ${cleanEmail}\n` +
                        `Subject: ${cleanSubject}\n\n` +
                        `Message:\n${cleanMessage}`
                });
            } else {
                console.warn(
                    "Admin email notification skipped: " +
                    "MAIL_USER, MAIL_PASS or ADMIN_EMAIL is missing."
                );
            }
        } catch (emailError) {
            console.error(
                "Contact notification email failed:",
                emailError.message
            );
        }

        return res.status(201).json({
            message: "Your message has been submitted successfully.",
            messageId: result.insertId
        });

    } catch (error) {
        console.error("Create contact message error:", error);

        return res.status(500).json({
            message: "Could not submit your message."
        });
    }
};

// =====================================================
// GET CONTACT MESSAGES
// Admin views visitor messages
// =====================================================

const getContactMessages = async (req, res) => {
    try {
        const [messages] = await db.query(
            `SELECT
                message_id AS id,
                customer_name AS name,
                phone,
                email,
                event_date,
                message,
                status,
                admin_reply AS reply,
                replied_at,
                created_at
             FROM contact_messages
             ORDER BY created_at DESC`
        );

        return res.status(200).json({
            messages
        });

    } catch (error) {
        console.error("Get contact messages error:", error);

        return res.status(500).json({
            message: "Could not load contact messages."
        });
    }
};

// =====================================================
// REPLY TO CONTACT MESSAGE
// Admin → Visitor
// =====================================================

const replyToContactMessage = async (req, res) => {
    try {
        const messageId = req.params.id;
        const { reply } = req.body;

        if (!messageId || !/^\d+$/.test(String(messageId))) {
            return res.status(400).json({
                message: "Invalid contact message ID."
            });
        }

        if (typeof reply !== "string" || !reply.trim()) {
            return res.status(400).json({
                message: "Please enter a reply."
            });
        }

        if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
            return res.status(500).json({
                message: "Email configuration is missing."
            });
        }

        // Find the original visitor message using the real column names
        const [messages] = await db.query(
            `SELECT
                message_id AS id,
                customer_name AS name,
                email,
                message
             FROM contact_messages
             WHERE message_id = ?
             LIMIT 1`,
            [messageId]
        );

        if (messages.length === 0) {
            return res.status(404).json({
                message: "Contact message not found."
            });
        }

        const contact = messages[0];

        // Send the reply to the visitor
        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: contact.email,
            subject: "Reply to your message - Annapriya",
            text:
                `Hello ${contact.name || "there"},\n\n` +
                `${reply.trim()}\n\n` +
                `Regards,\nAnnapriya Team`
        });

        // Save the reply only after the email sends successfully
        await db.query(
            `UPDATE contact_messages
             SET admin_reply = ?,
                 status = 'replied',
                 replied_at = NOW()
             WHERE message_id = ?`,
            [reply.trim(), messageId]
        );

        return res.status(200).json({
            message: "Reply sent successfully."
        });

    } catch (error) {
        console.error("Reply to contact message error:", error);

        return res.status(500).json({
            message: "Could not send the reply email."
        });
    }
};

// =====================================================
// EXPORT CONTROLLER FUNCTIONS
// =====================================================

module.exports = {
    createContactMessage,
    getContactMessages,
    replyToContactMessage
};
