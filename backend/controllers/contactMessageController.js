
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
// Visitor -> Admin
// =====================================================

const createContactMessage = async (req, res) => {
    try {
        const {
            customerName,
            name,
            phone,
            email,
            eventDate,
            message,
            subject
        } = req.body;

        const cleanName = String(customerName || name || "").trim();
        const cleanPhone = String(phone || "").trim();
        const cleanEmail = String(email || "").trim();
        const cleanMessage = String(message || "").trim();
        const cleanSubject = String(
            subject || "Contact Form Enquiry"
        ).trim();

        // Validate required fields
        if (!cleanName || !cleanPhone || !cleanEmail || !cleanMessage) {
            return res.status(400).json({
                message: "Please fill in all required contact form fields."
            });
        }

        // Validate email address (corrected)
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        // Validate optional event date
        let cleanEventDate = null;

        if (eventDate) {
            const dateString = String(eventDate).trim();

            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                return res.status(400).json({
                    message: "Please enter a valid event date."
                });
            }

            cleanEventDate = dateString;
        }

        // Save contact message to MySQL
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
             VALUES (?, ?, ?, ?, ?, 'new', NOW())`,
            [
                cleanName,
                cleanPhone,
                cleanEmail,
                cleanEventDate,
                `Subject: ${cleanSubject}\n\n${cleanMessage}`
            ]
        );

        // Notify admin by email if email settings are configured
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
                        `Name: ${cleanName}\n` +
                        `Phone: ${cleanPhone}\n` +
                        `Email: ${cleanEmail}\n` +
                        `Event Date: ${cleanEventDate || "Not provided"}\n\n` +
                        `Message:\n${cleanMessage}`
                });
            } else {
                console.warn(
                    "Admin email notification skipped: email settings are missing."
                );
            }
        } catch (emailError) {
            // The message is already saved, so email failure won't undo it
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
            message: "Could not submit your message.",
            error: error.message
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
            message: "Could not load contact messages.",
            error: error.message
        });
    }
};

// =====================================================
// REPLY TO CONTACT MESSAGE
// Admin -> Visitor
// =====================================================

const replyToContactMessage = async (req, res) => {
    try {
        const messageId = req.params.id;
        const { reply } = req.body;

        // Validate message ID
        if (!messageId || !/^\d+$/.test(String(messageId))) {
            return res.status(400).json({
                message: "Invalid contact message ID."
            });
        }

        // Validate reply text
        if (typeof reply !== "string" || !reply.trim()) {
            return res.status(400).json({
                message: "Please enter a reply."
            });
        }

        // Email settings are required to send replies
        if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
            return res.status(500).json({
                message: "Email configuration is missing."
            });
        }

        // Find original contact message
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

        // Send reply to visitor
        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: contact.email,
            subject: "Reply to your message - Annapriya",
            text:
                `Hello ${contact.name || "there"},\n\n` +
                `${reply.trim()}\n\n` +
                "Regards,\nAnnapriya Team"
        });

        // Save reply after email sends successfully
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
            message: "Could not send the reply email.",
            error: error.message
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
