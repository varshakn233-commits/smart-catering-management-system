const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const SALT_ROUNDS = 10;

const VALID_EVENTS_SERVED = ["0-50", "50-100", "100-200", "200+"];

const GMAIL_REGEX = /^[^\s@]+@gmail\.com$/i;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;


async function signup(req, res) {
    try {
        const {
            headName,
            brandName,
            phone,
            email,
            helpers,
            eventsServed,
            password,
            confirmPassword
        } = req.body;

        // Check required fields
        if (
            !headName ||
            !brandName ||
            !phone ||
            !email ||
            !helpers ||
            !eventsServed ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        // Validate events served
       const eventsNumber = Number(eventsServed);

if (isNaN(eventsNumber) || eventsNumber < 0) {
    return res.status(400).json({
        message: "Please enter a valid number of events served."
    });
}

let eventsServedRange;

if (eventsNumber < 50) {
    eventsServedRange = "0-50";
} else if (eventsNumber <= 100) {
    eventsServedRange = "50-100";
} else if (eventsNumber <= 200) {
    eventsServedRange = "100-200";
} else {
    eventsServedRange = "200+";
}

        // Gmail validation
        if (!GMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({
                message: "Please use a valid Gmail address ending with @gmail.com."
            });
        }

        // Password confirmation
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match."
            });
        }

        // Strong password validation
        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({
                message:
                    "Password must be at least 6 characters long and contain at least one letter, one number, and one special character."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Check if email already exists
        const [existing] = await db.query(
            "SELECT caterer_id FROM caterers WHERE email = ?",
            [cleanEmail]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "An application with this email already exists."
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(
            password,
            SALT_ROUNDS
        );

        // Insert caterer
        const [result] = await db.query(
            `INSERT INTO caterers
            (head_name, brand_name, phone, email, password_hash, helpers, events_served, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                headName,
                brandName,
                phone,
                cleanEmail,
                passwordHash,
                helpers,
                eventsServed
            ]
        );

        return res.status(201).json({
            message:
                "Application submitted. Your account will be reviewed by an admin before you can log in.",
            catererId: result.insertId
        });

    } catch (err) {
        console.error("Caterer signup error:", err);

        return res.status(500).json({
            message:
                "Something went wrong while submitting your application."
        });
    }
}


async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const [rows] = await db.query(
            "SELECT * FROM caterers WHERE email = ?",
            [cleanEmail]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const caterer = rows[0];

        const isMatch = await bcrypt.compare(
            password,
            caterer.password_hash
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Check admin approval
        if (caterer.status === "pending") {
            return res.status(403).json({
                message:
                    "Your application is still pending admin approval."
            });
        }

        if (caterer.status === "rejected") {
            return res.status(403).json({
                message:
                    "Your application was not approved. Please contact support."
            });
        }

        const token = jwt.sign(
            {
                catererId: caterer.caterer_id,
                email: caterer.email,
                role: "caterer"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            message: "Login successful.",
            token,
            caterer: {
                id: caterer.caterer_id,
                headName: caterer.head_name,
                brandName: caterer.brand_name,
                email: caterer.email
            }
        });

    } catch (err) {
        console.error("Caterer login error:", err);

        return res.status(500).json({
            message: "Something went wrong while logging in."
        });
    }
}


module.exports = {
    signup,
    login
};