const db = require("../config/db");

async function getApprovedCaterers(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT 
                caterer_id,
                head_name,
                brand_name,
                phone,
                email,
                helpers,
                events_served,
                status,
                created_at
             FROM caterers
             WHERE status = 'approved'
             ORDER BY created_at DESC`
        );

        return res.status(200).json({
            caterers: rows
        });

    } catch (err) {
        console.error("Get approved caterers error:", err);

        return res.status(500).json({
            message: "Could not fetch approved caterers."
        });
    }
}

module.exports = {
    getApprovedCaterers
};