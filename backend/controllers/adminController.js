const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");


// =====================================================
// ADMIN LOGIN
// =====================================================

async function login(req, res) {

    try {

        const {
            username,
            password
        } = req.body;


        if (!username || !password) {

            return res.status(400).json({
                message:
                    "Username and password are required."
            });

        }


        const [rows] = await db.query(
            "SELECT * FROM admins WHERE username = ?",
            [username]
        );


        if (rows.length === 0) {

            return res.status(401).json({
                message:
                    "Invalid username or password."
            });

        }


        const admin = rows[0];


        const isMatch =
            await bcrypt.compare(
                password,
                admin.password
            );


        if (!isMatch) {

            return res.status(401).json({
                message:
                    "Invalid username or password."
            });

        }


        const token = jwt.sign(

            {
                adminId: admin.admin_id,
                username: admin.username,
                role: "admin"
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }

        );


        return res.status(200).json({

            message:
                "Login successful.",

            token,

            admin: {
                id: admin.admin_id,
                username: admin.username
            }

        });


    } catch (err) {

        console.error(
            "Admin login error:",
            err
        );


        return res.status(500).json({

            message:
                "Something went wrong while logging in."

        });

    }

}



// =====================================================
// LIST CATERERS
// =====================================================

async function listCaterers(req, res) {

    try {

        const status =
            req.query.status;


        let rows;


        if (status) {

            [rows] = await db.query(

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

                 WHERE status = ?

                 ORDER BY created_at DESC`,

                [status]

            );

        } else {

            [rows] = await db.query(

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

                 ORDER BY created_at DESC`

            );

        }


        return res.status(200).json({

            caterers:
                rows

        });


    } catch (err) {

        console.error(
            "List caterers error:",
            err
        );


        return res.status(500).json({

            message:
                "Could not fetch caterers."

        });

    }

}



// =====================================================
// UPDATE CATERER STATUS
// =====================================================

async function updateCatererStatus(req, res) {

    try {

        const {
            id
        } = req.params;


        const {
            status
        } = req.body;


        if (
            ![
                "approved",
                "rejected"
            ].includes(status)
        ) {

            return res.status(400).json({

                message:
                    "Status must be 'approved' or 'rejected'."

            });

        }


        const [result] =
            await db.query(

                `UPDATE caterers
                 SET status = ?
                 WHERE caterer_id = ?`,

                [
                    status,
                    id
                ]

            );


        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                message:
                    "Caterer not found."

            });

        }


        return res.status(200).json({

            message:
                `Caterer ${status}.`

        });


    } catch (err) {

        console.error(
            "Update caterer status error:",
            err
        );


        return res.status(500).json({

            message:
                "Could not update caterer status."

        });

    }

}



// =====================================================
// CUSTOMER SUMMARY
// =====================================================

async function getCustomerSummary(req, res) {

    try {

        const [rows] =
            await db.query(

                `SELECT

                    COUNT(*) AS totalCustomers,

                    SUM(
                        CASE
                            WHEN status = 'active'
                            THEN 1
                            ELSE 0
                        END
                    ) AS activeCustomers,

                    SUM(
                        CASE
                            WHEN status = 'blocked'
                            THEN 1
                            ELSE 0
                        END
                    ) AS blockedCustomers,

                    SUM(
                        CASE
                            WHEN created_at >=
                            DATE_SUB(
                                NOW(),
                                INTERVAL 30 DAY
                            )
                            THEN 1
                            ELSE 0
                        END
                    ) AS newCustomers

                 FROM customers`

            );


        return res.status(200).json({

            summary: {

                totalCustomers:
                    Number(
                        rows[0].totalCustomers || 0
                    ),

                activeCustomers:
                    Number(
                        rows[0].activeCustomers || 0
                    ),

                blockedCustomers:
                    Number(
                        rows[0].blockedCustomers || 0
                    ),

                newCustomers:
                    Number(
                        rows[0].newCustomers || 0
                    )

            }

        });


    } catch (error) {

        console.error(
            "Customer summary error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load customer summary."

        });

    }

}



// =====================================================
// LIST CUSTOMERS
// =====================================================

async function listCustomers(req, res) {

    try {

        const {
            search,
            status
        } = req.query;


        let query = `

            SELECT

                customer_id,
                full_name,
                gender,
                address,
                phone,
                email,
                created_at,
                status

            FROM customers

            WHERE 1 = 1

        `;


        const params = [];


        // ---------------------------------------------
        // SEARCH
        // ---------------------------------------------

        if (search && search.trim()) {

            query += `

                AND (

                    full_name LIKE ?
                    OR email LIKE ?
                    OR phone LIKE ?
                    OR CAST(customer_id AS CHAR) LIKE ?

                )

            `;


            const searchValue =
                `%${search.trim()}%`;


            params.push(
                searchValue,
                searchValue,
                searchValue,
                searchValue
            );

        }


        // ---------------------------------------------
        // STATUS FILTER
        // ---------------------------------------------

        if (
            status === "active" ||
            status === "blocked"
        ) {

            query += `
                AND status = ?
            `;

            params.push(status);

        }


        query += `

            ORDER BY created_at DESC

        `;


        const [rows] =
            await db.query(
                query,
                params
            );


        return res.status(200).json({

            customers:
                rows

        });


    } catch (error) {

        console.error(
            "List customers error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load customers."

        });

    }

}



// =====================================================
// GET CUSTOMER DETAILS
// =====================================================

async function getCustomerDetails(req, res) {

    try {

        const {
            id
        } = req.params;


        if (!id) {

            return res.status(400).json({

                message:
                    "Customer ID is required."

            });

        }


        // =================================================
        // CUSTOMER INFORMATION
        // =================================================

        const [customerRows] =
            await db.query(

                `SELECT

                    customer_id,
                    full_name,
                    gender,
                    address,
                    phone,
                    email,
                    created_at,
                    status

                 FROM customers

                 WHERE customer_id = ?`,

                [id]

            );


        if (customerRows.length === 0) {

            return res.status(404).json({

                message:
                    "Customer not found."

            });

        }


        const customer =
            customerRows[0];


        // =================================================
        // BOOKING HISTORY
        // =================================================

        const [bookings] =
            await db.query(

                `SELECT

                    er.request_id,
                    er.event_type,
                    er.event_date,
                    er.event_time,
                    er.venue_location,
                    er.guest_count,
                    er.package_name,
                    er.budget,
                    er.status,
                    er.created_at,

                    c.brand_name AS caterer_name

                 FROM event_request er

                 LEFT JOIN caterers c
                    ON er.caterer_email = c.email

                 WHERE er.customer_id = ?

                 ORDER BY er.created_at DESC`,

                [id]

            );


        // =================================================
        // REVIEWS
        // =================================================

        const [reviews] =
            await db.query(

                `SELECT

                    r.review_id,
                    r.rating,
                    r.review_text,
                    r.created_at,
                    r.updated_at,

                    c.brand_name AS caterer_name

                 FROM reviews r

                 LEFT JOIN caterers c
                    ON r.caterer_id = c.caterer_id

                 WHERE r.customer_id = ?

                 ORDER BY r.created_at DESC`,

                [id]

            );


        // =================================================
        // SEND EVERYTHING
        // =================================================

        return res.status(200).json({

            customer,

            bookings,

            reviews

        });


    } catch (error) {

        console.error(
            "Get customer details error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load customer details."

        });

    }

}



// =====================================================
// BLOCK / UNBLOCK CUSTOMER
// =====================================================

async function updateCustomerStatus(req, res) {

    try {

        const {
            id
        } = req.params;


        const {
            status
        } = req.body;


        if (
            ![
                "active",
                "blocked"
            ].includes(status)
        ) {

            return res.status(400).json({

                message:
                    "Status must be 'active' or 'blocked'."

            });

        }


        const [result] =
            await db.query(

                `UPDATE customers

                 SET status = ?

                 WHERE customer_id = ?`,

                [
                    status,
                    id
                ]

            );


        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                message:
                    "Customer not found."

            });

        }


        return res.status(200).json({

            message:
                `Customer ${status}.`,

            status

        });


    } catch (error) {

        console.error(
            "Update customer status error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not update customer status."

        });

    }

}



// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    login,

    listCaterers,
    updateCatererStatus,

    getCustomerSummary,
    listCustomers,
    getCustomerDetails,
    updateCustomerStatus

};