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

            `SELECT *
             FROM admins
             WHERE username = ?`,

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
// CATERER MANAGEMENT
// =====================================================


// -----------------------------------------------------
// LIST CATERERS
// -----------------------------------------------------

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


// -----------------------------------------------------
// UPDATE CATERER STATUS
// -----------------------------------------------------

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
// CUSTOMER MANAGEMENT
// =====================================================


// -----------------------------------------------------
// CUSTOMER SUMMARY
// -----------------------------------------------------

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


// -----------------------------------------------------
// LIST CUSTOMERS
// -----------------------------------------------------

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


        if (
            search &&
            search.trim()
        ) {

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


// -----------------------------------------------------
// GET CUSTOMER DETAILS
// -----------------------------------------------------

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


        // CUSTOMER INFORMATION

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


        if (
            customerRows.length === 0
        ) {

            return res.status(404).json({

                message:
                    "Customer not found."

            });

        }


        const customer =
            customerRows[0];


        // BOOKING HISTORY

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


        // REVIEWS

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


// -----------------------------------------------------
// BLOCK / UNBLOCK CUSTOMER
// -----------------------------------------------------

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
// PAYMENT MANAGEMENT
// =====================================================


// -----------------------------------------------------
// PAYMENT SUMMARY
// -----------------------------------------------------

async function getPaymentSummary(req, res) {

    try {

        const [rows] =
            await db.query(

                `SELECT

                    COUNT(*) AS totalPayments,

                    SUM(
                        CASE
                            WHEN payment_status = 'paid'
                            THEN 1
                            ELSE 0
                        END
                    ) AS paidPayments,

                    SUM(
                        CASE
                            WHEN payment_status = 'pending'
                            THEN 1
                            ELSE 0
                        END
                    ) AS pendingPayments,

                    SUM(
                        CASE
                            WHEN payment_status = 'failed'
                            THEN 1
                            ELSE 0
                        END
                    ) AS failedPayments,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN payment_status = 'paid'
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS totalRevenue

                 FROM event_payments`

            );


        return res.status(200).json({

            summary: {

                totalPayments:
                    Number(
                        rows[0].totalPayments || 0
                    ),

                paidPayments:
                    Number(
                        rows[0].paidPayments || 0
                    ),

                pendingPayments:
                    Number(
                        rows[0].pendingPayments || 0
                    ),

                failedPayments:
                    Number(
                        rows[0].failedPayments || 0
                    ),

                totalRevenue:
                    Number(
                        rows[0].totalRevenue || 0
                    )

            }

        });


    } catch (error) {

        console.error(
            "Payment summary error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load payment summary."

        });

    }

}


// -----------------------------------------------------
// LIST PAYMENTS
// -----------------------------------------------------

async function listPayments(req, res) {

    try {

        const {
            search,
            status
        } = req.query;


        let query = `

            SELECT

                ep.payment_id,
                ep.request_id,
                ep.customer_id,
                ep.amount,
                ep.payment_status,
                ep.payment_method,
                ep.transaction_id,
                ep.paid_at,
                ep.created_at,

                c.full_name AS customer_name,
                c.email AS customer_email

            FROM event_payments ep

            LEFT JOIN customers c
                ON ep.customer_id = c.customer_id

            WHERE 1 = 1

        `;


        const params = [];


        if (
            search &&
            search.trim()
        ) {

            query += `

                AND (

                    c.full_name LIKE ?
                    OR c.email LIKE ?
                    OR ep.transaction_id LIKE ?
                    OR CAST(ep.payment_id AS CHAR) LIKE ?

                )

            `;


            const value =
                `%${search.trim()}%`;


            params.push(

                value,
                value,
                value,
                value

            );

        }


        if (
            status === "paid" ||
            status === "pending" ||
            status === "failed"
        ) {

            query += `

                AND ep.payment_status = ?

            `;


            params.push(status);

        }


        query += `

            ORDER BY ep.created_at DESC

        `;


        const [rows] =
            await db.query(
                query,
                params
            );


        return res.status(200).json({

            payments:
                rows

        });


    } catch (error) {

        console.error(
            "List payments error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load payments."

        });

    }

}


// -----------------------------------------------------
// GET PAYMENT DETAILS
// -----------------------------------------------------

async function getPaymentDetails(req, res) {

    try {

        const {
            id
        } = req.params;


        const [rows] =
            await db.query(

                `SELECT

                    ep.payment_id,
                    ep.request_id,
                    ep.customer_id,
                    ep.amount,
                    ep.payment_status,
                    ep.payment_method,
                    ep.transaction_id,
                    ep.paid_at,
                    ep.created_at,

                    c.full_name AS customer_name,
                    c.email AS customer_email,
                    c.phone AS customer_phone

                 FROM event_payments ep

                 LEFT JOIN customers c
                    ON ep.customer_id = c.customer_id

                 WHERE ep.payment_id = ?`,

                [id]

            );


        if (
            rows.length === 0
        ) {

            return res.status(404).json({

                message:
                    "Payment not found."

            });

        }


        return res.status(200).json({

            payment:
                rows[0]

        });


    } catch (error) {

        console.error(
            "Payment details error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load payment details."

        });

    }

}


// =====================================================
// REVIEW MANAGEMENT
// =====================================================


// -----------------------------------------------------
// REVIEW SUMMARY
// -----------------------------------------------------

async function getReviewSummary(req, res) {

    try {

        const [rows] =
            await db.query(

                `SELECT

                    COUNT(*) AS totalReviews,

                    COALESCE(
                        ROUND(AVG(rating), 1),
                        0
                    ) AS averageRating,

                    SUM(
                        CASE
                            WHEN rating = 5
                            THEN 1
                            ELSE 0
                        END
                    ) AS fiveStar,

                    SUM(
                        CASE
                            WHEN rating = 4
                            THEN 1
                            ELSE 0
                        END
                    ) AS fourStar,

                    SUM(
                        CASE
                            WHEN rating = 3
                            THEN 1
                            ELSE 0
                        END
                    ) AS threeStar,

                    SUM(
                        CASE
                            WHEN rating = 2
                            THEN 1
                            ELSE 0
                        END
                    ) AS twoStar,

                    SUM(
                        CASE
                            WHEN rating = 1
                            THEN 1
                            ELSE 0
                        END
                    ) AS oneStar

                 FROM reviews`

            );


        return res.status(200).json({

            summary: {

                totalReviews:
                    Number(
                        rows[0].totalReviews || 0
                    ),

                averageRating:
                    Number(
                        rows[0].averageRating || 0
                    ),

                fiveStar:
                    Number(
                        rows[0].fiveStar || 0
                    ),

                fourStar:
                    Number(
                        rows[0].fourStar || 0
                    ),

                threeStar:
                    Number(
                        rows[0].threeStar || 0
                    ),

                twoStar:
                    Number(
                        rows[0].twoStar || 0
                    ),

                oneStar:
                    Number(
                        rows[0].oneStar || 0
                    )

            }

        });


    } catch (error) {

        console.error(
            "Review summary error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load review summary."

        });

    }

}


// -----------------------------------------------------
// LIST REVIEWS
// -----------------------------------------------------

async function listReviews(req, res) {

    try {

        const {
            search,
            rating
        } = req.query;


        let query = `

            SELECT

                r.review_id,
                r.caterer_id,
                r.customer_id,
                r.rating,
                r.review_text,
                r.created_at,
                r.updated_at,

                c.full_name AS customer_name,
                c.email AS customer_email,

                ca.brand_name AS caterer_name

            FROM reviews r

            LEFT JOIN customers c
                ON r.customer_id = c.customer_id

            LEFT JOIN caterers ca
                ON r.caterer_id = ca.caterer_id

            WHERE 1 = 1

        `;


        const params = [];


        if (
            search &&
            search.trim()
        ) {

            query += `

                AND (

                    c.full_name LIKE ?
                    OR c.email LIKE ?
                    OR ca.brand_name LIKE ?
                    OR r.review_text LIKE ?

                )

            `;


            const value =
                `%${search.trim()}%`;


            params.push(

                value,
                value,
                value,
                value

            );

        }


        if (
            ["1", "2", "3", "4", "5"]
                .includes(String(rating))
        ) {

            query += `

                AND r.rating = ?

            `;


            params.push(
                Number(rating)
            );

        }


        query += `

            ORDER BY r.created_at DESC

        `;


        const [rows] =
            await db.query(
                query,
                params
            );


        return res.status(200).json({

            reviews:
                rows

        });


    } catch (error) {

        console.error(
            "List reviews error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load reviews."

        });

    }

}


// -----------------------------------------------------
// GET REVIEW DETAILS
// -----------------------------------------------------

async function getReviewDetails(req, res) {

    try {

        const {
            id
        } = req.params;


        const [rows] =
            await db.query(

                `SELECT

                    r.review_id,
                    r.caterer_id,
                    r.customer_id,
                    r.rating,
                    r.review_text,
                    r.created_at,
                    r.updated_at,

                    c.full_name AS customer_name,
                    c.email AS customer_email,

                    ca.brand_name AS caterer_name

                 FROM reviews r

                 LEFT JOIN customers c
                    ON r.customer_id = c.customer_id

                 LEFT JOIN caterers ca
                    ON r.caterer_id = ca.caterer_id

                 WHERE r.review_id = ?`,

                [id]

            );


        if (
            rows.length === 0
        ) {

            return res.status(404).json({

                message:
                    "Review not found."

            });

        }


        return res.status(200).json({

            review:
                rows[0]

        });


    } catch (error) {

        console.error(
            "Review details error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load review details."

        });

    }

}


// =====================================================
// REPORTS & ANALYTICS
// =====================================================


// -----------------------------------------------------
// REPORTS OVERVIEW
// -----------------------------------------------------

async function getReportsOverview(req, res) {

    try {

        const [
            customerRows,
            catererRows,
            bookingRows,
            revenueRows,
            reviewRows
        ] = await Promise.all([

            db.query(`

                SELECT COUNT(*) AS totalCustomers

                FROM customers

            `),

            db.query(`

                SELECT COUNT(*) AS totalCaterers

                FROM caterers

            `),

            db.query(`

                SELECT COUNT(*) AS totalBookings

                FROM event_request

            `),

            db.query(`

                SELECT

                    COALESCE(
                        SUM(
                            CASE
                                WHEN payment_status = 'paid'
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS totalRevenue

                FROM event_payments

            `),

            db.query(`

                SELECT

                    COUNT(*) AS totalReviews,

                    COALESCE(
                        ROUND(AVG(rating), 1),
                        0
                    ) AS averageRating

                FROM reviews

            `)

        ]);


        return res.status(200).json({

            totalCustomers:
                Number(
                    customerRows[0][0].totalCustomers || 0
                ),

            totalCaterers:
                Number(
                    catererRows[0][0].totalCaterers || 0
                ),

            totalBookings:
                Number(
                    bookingRows[0][0].totalBookings || 0
                ),

            totalEvents:
                Number(
                    bookingRows[0][0].totalBookings || 0
                ),

            totalRevenue:
                Number(
                    revenueRows[0][0].totalRevenue || 0
                ),

            totalReviews:
                Number(
                    reviewRows[0][0].totalReviews || 0
                ),

            averageRating:
                Number(
                    reviewRows[0][0].averageRating || 0
                ),

            openEnquiries: null

        });


    } catch (error) {

        console.error(
            "Reports overview error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load reports overview."

        });

    }

}


// -----------------------------------------------------
// BOOKING REPORT
// -----------------------------------------------------

async function getBookingReport(req, res) {

    try {

        const [statusRows] =
            await db.query(`

                SELECT

                    status,
                    COUNT(*) AS total

                FROM event_request

                GROUP BY status

                ORDER BY status

            `);


        const [trendRows] =
            await db.query(`

                SELECT

                    DATE(created_at) AS reportDate,
                    COUNT(*) AS total

                FROM event_request

                GROUP BY DATE(created_at)

                ORDER BY reportDate

            `);


        return res.status(200).json({

            statuses:
                statusRows,

            trend:
                trendRows

        });


    } catch (error) {

        console.error(
            "Booking report error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load booking report."

        });

    }

}


// -----------------------------------------------------
// REVENUE REPORT
// -----------------------------------------------------

async function getRevenueReport(req, res) {

    try {

        const [statusRows] =
            await db.query(`

                SELECT

                    payment_status,
                    COUNT(*) AS totalPayments,

                    COALESCE(
                        SUM(amount),
                        0
                    ) AS totalAmount

                FROM event_payments

                GROUP BY payment_status

                ORDER BY payment_status

            `);


        const [trendRows] =
            await db.query(`

                SELECT

                    DATE(
                        COALESCE(
                            paid_at,
                            created_at
                        )
                    ) AS reportDate,

                    COALESCE(
                        SUM(
                            CASE
                                WHEN payment_status = 'paid'
                                THEN amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS revenue

                FROM event_payments

                GROUP BY
                    DATE(
                        COALESCE(
                            paid_at,
                            created_at
                        )
                    )

                ORDER BY reportDate

            `);


        return res.status(200).json({

            statuses:
                statusRows,

            trend:
                trendRows

        });


    } catch (error) {

        console.error(
            "Revenue report error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load revenue report."

        });

    }

}


// -----------------------------------------------------
// CUSTOMER REPORT
// -----------------------------------------------------

async function getCustomerReport(req, res) {

    try {

        const [summaryRows] =
            await db.query(`

                SELECT

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
                    ) AS blockedCustomers

                FROM customers

            `);


        const [bookingCustomerRows] =
            await db.query(`

                SELECT DISTINCT

                    customer_id

                FROM event_request

                WHERE customer_id IS NOT NULL

            `);


        const totalCustomers =
            Number(
                summaryRows[0].totalCustomers || 0
            );


        const customersWithBookings =
            bookingCustomerRows.length;


        const customersWithoutBookings =
            Math.max(
                0,
                totalCustomers -
                customersWithBookings
            );


        const [registrationRows] =
            await db.query(`

                SELECT

                    DATE(created_at) AS registrationDate,
                    COUNT(*) AS total

                FROM customers

                GROUP BY DATE(created_at)

                ORDER BY registrationDate

            `);


        const [newCustomerRows] =
            await db.query(`

                SELECT

                    COUNT(*) AS total

                FROM customers

                WHERE created_at >=
                    DATE_SUB(
                        NOW(),
                        INTERVAL 30 DAY
                    )

            `);


        return res.status(200).json({

            totalCustomers,

            newCustomers:
                Number(
                    newCustomerRows[0].total || 0
                ),

            activeCustomers:
                Number(
                    summaryRows[0].activeCustomers || 0
                ),

            blockedCustomers:
                Number(
                    summaryRows[0].blockedCustomers || 0
                ),

            customersWithBookings,

            customersWithoutBookings,

            registrationTrend:
                registrationRows

        });


    } catch (error) {

        console.error(
            "Customer report error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load customer report."

        });

    }

}


// -----------------------------------------------------
// CATERER REPORT
// -----------------------------------------------------

async function getCatererReport(req, res) {

    try {

        const [rows] =
            await db.query(`

                SELECT

                    COUNT(*) AS totalCaterers,

                    SUM(
                        CASE
                            WHEN status = 'approved'
                            THEN 1
                            ELSE 0
                        END
                    ) AS approvedCaterers,

                    SUM(
                        CASE
                            WHEN status = 'pending'
                            THEN 1
                            ELSE 0
                        END
                    ) AS pendingCaterers,

                    SUM(
                        CASE
                            WHEN status = 'rejected'
                            THEN 1
                            ELSE 0
                        END
                    ) AS rejectedCaterers

                FROM caterers

            `);


        return res.status(200).json({

            totalCaterers:
                Number(
                    rows[0].totalCaterers || 0
                ),

            approvedCaterers:
                Number(
                    rows[0].approvedCaterers || 0
                ),

            pendingCaterers:
                Number(
                    rows[0].pendingCaterers || 0
                ),

            rejectedCaterers:
                Number(
                    rows[0].rejectedCaterers || 0
                ),

            blockedCaterers: null,

            activeCaterers: null

        });


    } catch (error) {

        console.error(
            "Caterer report error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load caterer report."

        });

    }

}


// -----------------------------------------------------
// EVENT TYPE REPORT
// -----------------------------------------------------

async function getEventTypeReport(req, res) {

    try {

        const [rows] =
            await db.query(`

                SELECT

                    event_type,
                    COUNT(*) AS total

                FROM event_request

                GROUP BY event_type

                ORDER BY total DESC

            `);


        return res.status(200).json({

            eventTypes:
                rows

        });


    } catch (error) {

        console.error(
            "Event type report error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load event type report."

        });

    }

}


// -----------------------------------------------------
// REVIEW REPORT
// -----------------------------------------------------

async function getReviewReport(req, res) {

    try {

        const [summaryRows] =
            await db.query(`

                SELECT

                    COUNT(*) AS totalReviews,

                    COALESCE(
                        ROUND(AVG(rating), 1),
                        0
                    ) AS averageRating,

                    SUM(
                        CASE
                            WHEN rating = 5
                            THEN 1
                            ELSE 0
                        END
                    ) AS fiveStar,

                    SUM(
                        CASE
                            WHEN rating = 4
                            THEN 1
                            ELSE 0
                        END
                    ) AS fourStar,

                    SUM(
                        CASE
                            WHEN rating = 3
                            THEN 1
                            ELSE 0
                        END
                    ) AS threeStar,

                    SUM(
                        CASE
                            WHEN rating = 2
                            THEN 1
                            ELSE 0
                        END
                    ) AS twoStar,

                    SUM(
                        CASE
                            WHEN rating = 1
                            THEN 1
                            ELSE 0
                        END
                    ) AS oneStar

                FROM reviews

            `);


        return res.status(200).json({

            totalReviews:
                Number(
                    summaryRows[0].totalReviews || 0
                ),

            averageRating:
                Number(
                    summaryRows[0].averageRating || 0
                ),

            distribution: {

                fiveStar:
                    Number(
                        summaryRows[0].fiveStar || 0
                    ),

                fourStar:
                    Number(
                        summaryRows[0].fourStar || 0
                    ),

                threeStar:
                    Number(
                        summaryRows[0].threeStar || 0
                    ),

                twoStar:
                    Number(
                        summaryRows[0].twoStar || 0
                    ),

                oneStar:
                    Number(
                        summaryRows[0].oneStar || 0
                    )

            }

        });


    } catch (error) {

        console.error(
            "Review report error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load review report."

        });

    }

}


// -----------------------------------------------------
// CATERER PERFORMANCE REPORT
// -----------------------------------------------------

async function getCatererPerformance(req, res) {

    try {

        const [rows] =
            await db.query(`

                SELECT

                    c.caterer_id,

                    c.brand_name AS caterer_name,

                    (
                        SELECT COUNT(*)
                        FROM event_request er
                        WHERE er.caterer_email = c.email
                    ) AS requests,

                    (
                        SELECT COUNT(*)
                        FROM event_request er
                        WHERE er.caterer_email = c.email
                        AND er.status = 'accepted'
                    ) AS accepted,

                    (
                        SELECT COUNT(*)
                        FROM event_request er
                        WHERE er.caterer_email = c.email
                        AND er.status = 'completed'
                    ) AS completed,

                    (
                        SELECT COUNT(*)
                        FROM reviews r
                        WHERE r.caterer_id = c.caterer_id
                    ) AS reviews,

                    (
                        SELECT
                            COALESCE(
                                ROUND(
                                    AVG(r.rating),
                                    1
                                ),
                                0
                            )
                        FROM reviews r
                        WHERE r.caterer_id = c.caterer_id
                    ) AS average_rating

                FROM caterers c

                ORDER BY requests DESC

            `);


        return res.status(200).json({

            performance:
                rows

        });


    } catch (error) {

        console.error(
            "Caterer performance error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not load caterer performance."

        });

    }

}


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    // ADMIN
    login,

    // CATERERS
    listCaterers,
    updateCatererStatus,

    // CUSTOMERS
    getCustomerSummary,
    listCustomers,
    getCustomerDetails,
    updateCustomerStatus,

    // PAYMENTS
    getPaymentSummary,
    listPayments,
    getPaymentDetails,

    // REVIEWS
    getReviewSummary,
    listReviews,
    getReviewDetails,

    // REPORTS
    getReportsOverview,
    getBookingReport,
    getRevenueReport,
    getCustomerReport,
    getCatererReport,
    getEventTypeReport,
    getReviewReport,
    getCatererPerformance

};