const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

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

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters."
            });
        }

        const [existing] = await db.query(
            "SELECT customer_id FROM customers WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Email already registered."
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO customers
            (full_name, gender, address, phone, email, password_hash)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                fullName,
                gender,
                address,
                phone,
                email,
                passwordHash
            ]
        );

        res.status(201).json({
            message: "Account created successfully.",
            customerId: result.insertId
        });

    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
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

        const [rows] = await db.query(
            "SELECT * FROM customers WHERE email = ?",
            [email]
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

        res.status(200).json({
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

        res.status(500).json({
            message: "Server error while logging in."
        });
    }
}


module.exports = {
    signup,
    login
};