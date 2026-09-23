const db = require("../config/db");


// =========================
// SAVE CATERER
// =========================
async function saveCaterer(req, res) {
    try {

        const {
            customerId,
            catererId
        } = req.body;


        if (!customerId || !catererId) {
            return res.status(400).json({
                message: "Customer ID and Caterer ID are required."
            });
        }


        await db.query(
            `INSERT INTO saved_caterers
            (customer_id, caterer_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE
            customer_id = customer_id`,
            [
                customerId,
                catererId
            ]
        );


        return res.status(201).json({
            message: "Caterer saved successfully."
        });


    } catch (error) {

        console.error(
            "Save caterer error:",
            error
        );

        return res.status(500).json({
            message: "Could not save caterer."
        });
    }
}



// =========================
// REMOVE SAVED CATERER
// =========================
async function removeSavedCaterer(req, res) {
    try {

        const {
            customerId,
            catererId
        } = req.body;


        if (!customerId || !catererId) {
            return res.status(400).json({
                message: "Customer ID and Caterer ID are required."
            });
        }


        const [result] = await db.query(
            `DELETE FROM saved_caterers
             WHERE customer_id = ?
             AND caterer_id = ?`,
            [
                customerId,
                catererId
            ]
        );


        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Saved caterer not found."
            });
        }


        return res.status(200).json({
            message: "Caterer removed from saved list."
        });


    } catch (error) {

        console.error(
            "Remove saved caterer error:",
            error
        );

        return res.status(500).json({
            message: "Could not remove saved caterer."
        });
    }
}



// =========================
// GET SAVED CATERERS
// =========================
async function getSavedCaterers(req, res) {
    try {

        const {
            customerId
        } = req.params;


        if (!customerId) {
            return res.status(400).json({
                message: "Customer ID is required."
            });
        }


        const [rows] = await db.query(
            `SELECT
                sc.saved_id,
                sc.customer_id,
                sc.caterer_id,
                sc.created_at,

                c.head_name,
                c.brand_name,
                c.phone,
                c.email,
                c.helpers,
                c.events_served,
                c.status

             FROM saved_caterers sc

             INNER JOIN caterers c
                ON sc.caterer_id = c.caterer_id

             WHERE sc.customer_id = ?

             ORDER BY sc.created_at DESC`,
            [
                customerId
            ]
        );


        return res.status(200).json({
            caterers: rows
        });


    } catch (error) {

        console.error(
            "Get saved caterers error:",
            error
        );

        return res.status(500).json({
            message: "Could not fetch saved caterers."
        });
    }
}



module.exports = {
    saveCaterer,
    removeSavedCaterer,
    getSavedCaterers
};