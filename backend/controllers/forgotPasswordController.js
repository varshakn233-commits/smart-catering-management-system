const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("../config/db");

/* =====================================================
   EMAIL SETUP
===================================================== */

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});


/* =====================================================
   TEMPORARY OTP STORAGE
===================================================== */

const otpStore = new Map();


/* =====================================================
   GENERATE 6-DIGIT OTP
===================================================== */

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


/* =====================================================
   SEND OTP
===================================================== */

async function sendForgotPasswordOTP(req, res) {
    try {
        const { accountType } = req.params;

        let identity;
        let emailToSend;

        if (accountType === "admin") {
            identity = req.body.username;
        } else {
            identity = req.body.email;
        }

        if (!identity) {
            return res.status(400).json({
                message:
                    accountType === "admin"
                        ? "Admin username is required."
                        : "Email is required."
            });
        }


        /* =================================================
           CUSTOMER
        ================================================= */

        if (accountType === "customer") {

            emailToSend = identity.trim().toLowerCase();

            const [rows] = await db.query(
                "SELECT customer_id FROM customers WHERE email = ?",
                [emailToSend]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    message: "No customer account found with this email."
                });
            }
        }


        /* =================================================
           CATERER
        ================================================= */

        else if (accountType === "caterer") {

            emailToSend = identity.trim().toLowerCase();

            const [rows] = await db.query(
                "SELECT caterer_id FROM caterers WHERE email = ?",
                [emailToSend]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    message: "No caterer account found with this email."
                });
            }
        }


        /* =================================================
           ADMIN
        ================================================= */

        else if (accountType === "admin") {

            const username = identity.trim();

            const [rows] = await db.query(
                "SELECT admin_id, username FROM admins WHERE username = ?",
                [username]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    message: "Admin username not found."
                });
            }

            /*
            The admin username is NOT used as the
            OTP destination.

            OTP will be sent to MAIL_USER from .env.
            */

            emailToSend = process.env.MAIL_USER;

            if (!emailToSend) {
                return res.status(500).json({
                    message: "MAIL_USER is not configured in .env."
                });
            }
        }


        /* =================================================
           INVALID ACCOUNT TYPE
        ================================================= */

        else {
            return res.status(400).json({
                message: "Invalid account type."
            });
        }


        /* =================================================
           GENERATE OTP
        ================================================= */

        const otp = generateOTP();

        const resetId = crypto
            .randomBytes(32)
            .toString("hex");

        /*
        OTP valid for 5 minutes
        */

        const expiresAt = Date.now() + 5 * 60 * 1000;


        otpStore.set(resetId, {
            accountType,
            identity: identity.trim(),
            otp,
            expiresAt,
            verified: false
        });


        /* =================================================
           SEND EMAIL
        ================================================= */

        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: emailToSend,
            subject: "Annapriya - Password Reset OTP",
            text:
                `Your Annapriya password reset OTP is: ${otp}\n\n` +
                `This OTP is valid for 5 minutes.\n\n` +
                `If you did not request a password reset, please ignore this email.`
        });


        console.log(
            `🔐 Password reset OTP sent for ${accountType}`
        );


        return res.status(200).json({
            message: "OTP sent successfully.",
            resetId
        });

    } catch (err) {

        console.error(
            "Forgot password OTP error:",
            err
        );

        return res.status(500).json({
            message:
                "Could not send OTP. Please check your email configuration."
        });
    }
}


/* =====================================================
   VERIFY OTP
===================================================== */

async function verifyForgotPasswordOTP(req, res) {
    try {

        const { resetId, otp } = req.body;

        if (!resetId || !otp) {
            return res.status(400).json({
                message: "Reset ID and OTP are required."
            });
        }


        const resetData = otpStore.get(resetId);

        if (!resetData) {
            return res.status(400).json({
                message:
                    "Invalid or expired password reset request."
            });
        }


        /* Check expiry */

        if (Date.now() > resetData.expiresAt) {

            otpStore.delete(resetId);

            return res.status(400).json({
                message:
                    "OTP has expired. Please request a new OTP."
            });
        }


        /* Check OTP */

        if (otp.toString() !== resetData.otp) {

            return res.status(400).json({
                message: "Invalid OTP."
            });
        }


        /* Mark verified */

        resetData.verified = true;


        /* Generate reset token */

        const resetToken = crypto
            .randomBytes(32)
            .toString("hex");

        resetData.resetToken = resetToken;


        return res.status(200).json({
            message: "OTP verified successfully.",
            resetToken
        });

    } catch (err) {

        console.error(
            "OTP verification error:",
            err
        );

        return res.status(500).json({
            message:
                "Something went wrong while verifying the OTP."
        });
    }
}


/* =====================================================
   RESET PASSWORD
===================================================== */

async function resetPassword(req, res) {

    try {

        const {
            resetToken,
            newPassword,
            confirmPassword
        } = req.body;


        if (
            !resetToken ||
            !newPassword ||
            !confirmPassword
        ) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }


        /* Find reset request */

        let resetEntry = null;
        let resetKey = null;


        for (const [key, value] of otpStore.entries()) {

            if (value.resetToken === resetToken) {

                resetEntry = value;
                resetKey = key;

                break;
            }
        }


        if (!resetEntry) {

            return res.status(400).json({
                message:
                    "Invalid or expired password reset token."
            });
        }


        /* OTP must be verified */

        if (!resetEntry.verified) {

            return res.status(403).json({
                message:
                    "Please verify the OTP before resetting your password."
            });
        }


        /* Check expiry */

        if (Date.now() > resetEntry.expiresAt) {

            otpStore.delete(resetKey);

            return res.status(400).json({
                message:
                    "Password reset request has expired."
            });
        }


        /* Check passwords */

        if (newPassword !== confirmPassword) {

            return res.status(400).json({
                message: "Passwords do not match."
            });
        }


        /* Password validation */

        if (newPassword.length < 6) {

            return res.status(400).json({
                message:
                    "Password must be at least 6 characters long."
            });
        }


        /* Hash password */

        const passwordHash = await bcrypt.hash(
            newPassword,
            10
        );


        /* =================================================
           CUSTOMER
        ================================================= */

        if (resetEntry.accountType === "customer") {

            await db.query(
                "UPDATE customers SET password_hash = ? WHERE email = ?",
                [
                    passwordHash,
                    resetEntry.identity
                        .trim()
                        .toLowerCase()
                ]
            );
        }


        /* =================================================
           CATERER
        ================================================= */

        else if (resetEntry.accountType === "caterer") {

            await db.query(
                "UPDATE caterers SET password_hash = ? WHERE email = ?",
                [
                    passwordHash,
                    resetEntry.identity
                        .trim()
                        .toLowerCase()
                ]
            );
        }


        /* =================================================
           ADMIN
        ================================================= */

        else if (resetEntry.accountType === "admin") {

            await db.query(
                "UPDATE admins SET password = ? WHERE username = ?",
                [
                    passwordHash,
                    resetEntry.identity.trim()
                ]
            );
        }


        /* Delete used reset request */

        otpStore.delete(resetKey);


        return res.status(200).json({
            message:
                "Password reset successful. You can now login with your new password."
        });

    } catch (err) {

        console.error(
            "Reset password error:",
            err
        );

        return res.status(500).json({
            message:
                "Something went wrong while resetting the password."
        });
    }
}


/* =====================================================
   EXPORT
===================================================== */

module.exports = {
    sendForgotPasswordOTP,
    verifyForgotPasswordOTP,
    resetPassword
};