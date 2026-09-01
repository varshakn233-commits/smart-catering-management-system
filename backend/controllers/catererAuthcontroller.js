const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const SALT_ROUNDS = 10;
const VALID_EVENTS_SERVED = ["0-50", "50-100", "100-200", "200+"];

async function signup(req, res) {
    try {
        const {
            headName, brandName, phone, email,
            helpers, eventsServed,
            password, confirmPassword
        } = req.body;

        if (!headName || !brandName || !phone || !email || !helpers || !eventsServed || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (!VALID_EVENTS_SERVED.includes(eventsServed)) {
            return res.status(400).json({ message: "Invalid events served option." });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        const [existing] = await db.query(
            "SELECT caterer_id FROM caterers WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: "An application with this email already exists." });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const [result] = await db.query(
            `INSERT INTO caterers (head_name, brand_name, phone, email, password_hash, helpers, events_served, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [headName, brandName, phone, email, passwordHash, helpers, eventsServed]
        );

        return res.status(201).json({
            message: "Application submitted. Your account will be reviewed by an admin before you can log in.",
            catererId: result.insertId
        });

    } catch (err) {
        console.error("Caterer signup error:", err);
        return res.status(500).json({ message: "Something went wrong while submitting your application." });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const [rows] = await db.query("SELECT * FROM caterers WHERE email = ?", [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const caterer = rows[0];
        const isMatch = await bcrypt.compare(password, caterer.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        if (caterer.status === "pending") {
            return res.status(403).json({ message: "Your application is still pending admin approval." });
        }

        if (caterer.status === "rejected") {
            return res.status(403).json({ message: "Your application was not approved. Please contact support." });
        }

        const token = jwt.sign(
            { catererId: caterer.caterer_id, email: caterer.email, role: "caterer" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
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
        return res.status(500).json({ message: "Something went wrong while logging in." });
    }
}

module.exports = { signup, login };