const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }

        const [rows] = await db.query("SELECT * FROM admins WHERE username = ?", [username]);

        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const token = jwt.sign(
            { adminId: admin.admin_id, username: admin.username, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful.",
            token,
            admin: { id: admin.admin_id, username: admin.username }
        });

    } catch (err) {
        console.error("Admin login error:", err);
        return res.status(500).json({ message: "Something went wrong while logging in." });
    }
}

async function listCaterers(req, res) {
    try {
        const status = req.query.status;

        let rows;
        if (status) {
            [rows] = await db.query(
                `SELECT caterer_id, head_name, brand_name, phone, email, helpers, events_served, status, created_at
                 FROM caterers WHERE status = ? ORDER BY created_at DESC`,
                [status]
            );
        } else {
            [rows] = await db.query(
                `SELECT caterer_id, head_name, brand_name, phone, email, helpers, events_served, status, created_at
                 FROM caterers ORDER BY created_at DESC`
            );
        }

        return res.status(200).json({ caterers: rows });

    } catch (err) {
        console.error("List caterers error:", err);
        return res.status(500).json({ message: "Could not fetch caterers." });
    }
}

async function updateCatererStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Status must be 'approved' or 'rejected'." });
        }

        const [result] = await db.query(
            "UPDATE caterers SET status = ? WHERE caterer_id = ?",
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Caterer not found." });
        }

        return res.status(200).json({ message: `Caterer ${status}.` });

    } catch (err) {
        console.error("Update caterer status error:", err);
        return res.status(500).json({ message: "Could not update caterer status." });
    }
}

module.exports = { login, listCaterers, updateCatererStatus };