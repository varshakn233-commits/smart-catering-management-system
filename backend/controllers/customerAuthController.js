const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const GMAIL_REGEX = /^[^\s@]+@gmail\.com$/i;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;

async function signup(req, res) {
    try {
        const {
            fullName,
            gender,
            address,
            phone,
            email,
            password,
            confirmPassword
        } = req.body;

        // Check required fields
        if (
            !fullName ||
            !gender ||
            !address ||
            !phone ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                message: "All fields are required."
            });
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
            "SELECT customer_id FROM customers WHERE email = ?",
            [cleanEmail]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Email already registered."
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert customer
        const [result] = await db.query(
            `INSERT INTO customers
            (full_name, gender, address, phone, email, password_hash)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                fullName,
                gender,
                address,
                phone,
                cleanEmail,
                passwordHash
            ]
        );

        return res.status(201).json({
            message: "Account created successfully.",
            customerId: result.insertId
        });

    } catch (error) {
        console.error("Signup error:", error);

        return res.status(500).json({
            message: "Server error while creating account."
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
            "SELECT * FROM customers WHERE email = ?",
            [cleanEmail]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const customer = rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            customer.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {
                customerId: customer.customer_id,
                email: customer.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            message: "Login successful.",
            token: token,
            customer: {
                id: customer.customer_id,
                fullName: customer.full_name,
                email: customer.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Server error while logging in."
        });
    }
}


module.exports = {
    signup,
    login
};