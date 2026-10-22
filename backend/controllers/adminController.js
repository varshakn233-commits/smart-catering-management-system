const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { execFile } = require("child_process");
const path = require("path");

// =====================================================
// ADMIN LOGIN
// =====================================================

async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required."
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
                message: "Invalid username or password."
            });
        }

        const admin = rows[0];

        const isMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid username or password."
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
            message: "Login successful.",
            token,
            admin: {
                id: admin.admin_id,
                username: admin.username
            }
        });

    } catch (err) {
        console.error("Admin login error:", err);

        return res.status(500).json({
            message: "Something went wrong while logging in."
        });
    }
}

// =====================================================
// ADMIN CHANGE PASSWORD
// =====================================================

const changeAdminPassword = async (req, res) => {
    try {
        const adminId = req.admin.adminId;

        const {
            currentPassword,
            newPassword,
            confirmPassword
        } = req.body;

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            return res.status(400).json({
                message: "All password fields are required."
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "New passwords do not match."
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message:
                    "Password must be at least 6 characters long."
            });
        }

        const [admins] = await db.query(
            "SELECT admin_id, password FROM admins WHERE admin_id = ?",
            [adminId]
        );

        if (admins.length === 0) {
            return res.status(404).json({
                message: "Admin account not found."
            });
        }

        const admin = admins[0];

        const passwordMatch = await bcrypt.compare(
            currentPassword,
            admin.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Current password is incorrect."
            });
        }

        const samePassword = await bcrypt.compare(
            newPassword,
            admin.password
        );

        if (samePassword) {
            return res.status(400).json({
                message:
                    "New password must be different from the current password."
            });
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        await db.query(
            "UPDATE admins SET password = ? WHERE admin_id = ?",
            [
                hashedPassword,
                adminId
            ]
        );

        return res.status(200).json({
            message: "Password changed successfully."
        });

    } catch (error) {
        console.error(
            "Admin change password error:",
            error
        );

        return res.status(500).json({
            message: "Failed to change password."
        });
    }
};

// =====================================================
// CATERER MANAGEMENT
// =====================================================

async function listCaterers(req, res) {
    try {
        const status = req.query.status;

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
            caterers: rows
        });

    } catch (err) {
        console.error(
            "List caterers error:",
            err
        );

        return res.status(500).json({
            message: "Could not fetch caterers."
        });
    }
}

async function updateCatererStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

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
            customers: rows
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

async function getCustomerDetails(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message:
                    "Customer ID is required."
            });
        }

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

async function updateCustomerStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

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

async function listPayments(req, res) {
    try {
        const { search, status } = req.query;

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
                ep.processing_at,
                ep.failed_at,
                ep.refund_status,
                ep.refund_requested_at,
                ep.refunded_at,
                ep.refund_amount,

                c.full_name AS customer_name,
                c.email AS customer_email,
                c.phone AS customer_phone,

                er.event_type,
                er.event_date,
                er.event_time,
                er.package_name,
                er.catering_service,
                er.caterer_email,

                ca.brand_name AS caterer_name

            FROM event_payments ep

            LEFT JOIN customers c
                ON ep.customer_id = c.customer_id

            LEFT JOIN event_request er
                ON ep.request_id = er.request_id

            LEFT JOIN caterers ca
                ON LOWER(TRIM(er.caterer_email))
                 = LOWER(TRIM(ca.email))

            WHERE 1 = 1
        `;

        const params = [];

        if (search && search.trim()) {
            query += `
                AND (
                    c.full_name LIKE ?
                    OR c.email LIKE ?
                    OR ep.transaction_id LIKE ?
                    OR CAST(ep.payment_id AS CHAR) LIKE ?
                    OR CAST(ep.request_id AS CHAR) LIKE ?
                    OR ca.brand_name LIKE ?
                )
            `;

            const value = `%${search.trim()}%`;

            params.push(
                value,
                value,
                value,
                value,
                value,
                value
            );
        }

        const allowedStatuses = [
            "pending",
            "processing",
            "paid",
            "failed",
            "refunded"
        ];

        if (allowedStatuses.includes(status)) {
            query += `
                AND ep.payment_status = ?
            `;

            params.push(status);
        }

        query += `
            ORDER BY ep.created_at DESC,
                     ep.payment_id DESC
        `;

        const [rows] = await db.query(query, params);

        return res.status(200).json({
            payments: rows
        });

    } catch (error) {
        console.error("List payments error:", error);

        return res.status(500).json({
            message: "Could not load payments."
        });
    }
}



async function getPaymentDetails(req, res) {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
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

                ep.processing_at,
                ep.failed_at,
                ep.refund_status,
                ep.refund_requested_at,
                ep.refunded_at,
                ep.refund_amount,

                c.full_name AS customer_name,
                c.email AS customer_email,
                c.phone AS customer_phone,

                er.event_type,
                er.event_date,
                er.event_time,
                er.venue_location,
                er.guest_count,
                er.package_name,
                er.catering_service,
                er.caterer_email,

                ca.brand_name AS caterer_name

             FROM event_payments ep

             LEFT JOIN customers c
                ON ep.customer_id = c.customer_id

             LEFT JOIN event_request er
                ON ep.request_id = er.request_id

             LEFT JOIN caterers ca
                ON LOWER(TRIM(er.caterer_email))
                 = LOWER(TRIM(ca.email))

             WHERE ep.payment_id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Payment not found."
            });
        }

        return res.status(200).json({
            payment: rows[0]
        });

    } catch (error) {
        console.error(
            "Payment details error:",
            error
        );

        return res.status(500).json({
            message: "Could not load payment details."
        });
    }
}

// =====================================================
// REVIEW MANAGEMENT
// =====================================================

async function getReviewSummary(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT
                COUNT(*) AS totalReviews,

                COALESCE(ROUND(AVG(rating), 1), 0)
                    AS averageRating,

                COALESCE(SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END), 0)
                    AS fiveStarReviews,

                COALESCE(SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END), 0)
                    AS fourStarReviews,

                COALESCE(SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END), 0)
                    AS threeStarReviews,

                COALESCE(SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END), 0)
                    AS twoStarReviews,

                COALESCE(SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END), 0)
                    AS oneStarReviews

            FROM reviews
        `);

        const summary = rows[0];

        return res.status(200).json({
            summary: {
                totalReviews: Number(summary.totalReviews || 0),
                averageRating: Number(summary.averageRating || 0),
                fiveStarReviews: Number(summary.fiveStarReviews || 0),
                fourStarReviews: Number(summary.fourStarReviews || 0),
                threeStarReviews: Number(summary.threeStarReviews || 0),
                twoStarReviews: Number(summary.twoStarReviews || 0),
                oneStarReviews: Number(summary.oneStarReviews || 0)
            }
        });

    } catch (error) {
        console.error("Review summary error:", error);

        return res.status(500).json({
            message: "Could not load review summary."
        });
    }
}

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
            [
                "1",
                "2",
                "3",
                "4",
                "5"
            ].includes(String(rating))
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
            reviews: rows
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

async function getReviewDetails(req, res) {
    try {
        const { id } = req.params;

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
                    c.phone AS customer_phone,

                    ca.brand_name AS caterer_name,
                    ca.email AS caterer_email

                 FROM reviews r

                 LEFT JOIN customers c
                    ON r.customer_id = c.customer_id

                 LEFT JOIN caterers ca
                    ON r.caterer_id = ca.caterer_id

                 WHERE r.review_id = ?`,
                [id]
            );

        if (rows.length === 0) {
            return res.status(404).json({
                message:
                    "Review not found."
            });
        }

        return res.status(200).json({
            review: rows[0]
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

/* =====================================================
   SENTIMENT ANALYSIS
   Text-based lexicon sentiment scoring
===================================================== */


async function getSentimentAnalysis(req, res) {
    const projectRoot = path.resolve(__dirname, "..", "..");

    const scriptPath = path.join(
        projectRoot,
        "ml",
        "sentiment_analysis.py"
    );

    execFile(
        "python",
        [scriptPath],
        {
            cwd: projectRoot,
            windowsHide: true,
            maxBuffer: 10 * 1024 * 1024
        },
        (error, stdout, stderr) => {
            if (error) {
                console.error(
                    "Python sentiment analysis error:",
                    stderr || error.message
                );

                return res.status(500).json({
                    message:
                        "Could not run Python sentiment analysis. Check Python and database configuration."
                });
            }

            try {
                const result = JSON.parse(stdout);

                const counts = result.sentiment_counts || {};
                const percentages =
                    result.sentiment_percentages || {};

                const reviews = (result.reviews || []).map(
                    review => ({
                        ...review,
                        rating: Number(review.rating || 0),
                        sentimentScore: Number(review.score || 0)
                    })
                );

                return res.status(200).json({
                    method: result.method,

                    summary: {
                        totalReviews:
                            Number(result.total_reviews_analyzed || 0),

                        totalReviewsInDatabase:
                            Number(result.total_reviews_in_database || 0),

                        emptyReviewsSkipped:
                            Number(result.empty_reviews_skipped || 0),

                        positive: Number(counts.Positive || 0),
                        neutral: Number(counts.Neutral || 0),
                        negative: Number(counts.Negative || 0),

                        positivePercentage:
                            Number(percentages.Positive || 0),

                        neutralPercentage:
                            Number(percentages.Neutral || 0),

                        negativePercentage:
                            Number(percentages.Negative || 0)
                    },

                    reviews
                });
            } catch (parseError) {
                console.error(
                    "Could not parse sentiment JSON:",
                    parseError.message
                );

                return res.status(500).json({
                    message: "Python returned invalid sentiment data."
                });
            }
        }
    );
}


// =====================================================
// REPORTS & ANALYTICS
// =====================================================


/* =====================================================
   REPORT FILTER HELPERS
===================================================== */

function getBookingReportFilters(req, alias = "er") {
    const clauses = [];
    const params = [];

    const {
        year,
        month,
        eventType,
        status,
        startDate,
        endDate
    } = req.query;

    if (year && /^\d{4}$/.test(String(year))) {
        clauses.push(`YEAR(${alias}.event_date) = ?`);
        params.push(Number(year));
    }

    if (
        month &&
        /^\d{1,2}$/.test(String(month)) &&
        Number(month) >= 1 &&
        Number(month) <= 12
    ) {
        clauses.push(`MONTH(${alias}.event_date) = ?`);
        params.push(Number(month));
    }

    if (eventType && String(eventType).trim()) {
        clauses.push(`${alias}.event_type = ?`);
        params.push(String(eventType).trim());
    }

    const allowedBookingStatuses = [
        "pending",
        "accepted",
        "payment_pending",
        "confirmed",
        "preparing",
        "on_the_way",
        "event_started",
        "completed",
        "rejected"
    ];

    if (allowedBookingStatuses.includes(status)) {
        clauses.push(`${alias}.status = ?`);
        params.push(status);
    }

    const validDate = /^\d{4}-\d{2}-\d{2}$/;

    if (startDate && validDate.test(String(startDate))) {
        clauses.push(`DATE(${alias}.event_date) >= ?`);
        params.push(startDate);
    }

    if (endDate && validDate.test(String(endDate))) {
        clauses.push(`DATE(${alias}.event_date) <= ?`);
        params.push(endDate);
    }

    return {
        sql: clauses.length ? ` AND ${clauses.join(" AND ")}` : "",
        params
    };
}


/* =====================================================
   RETAINED REVENUE EXPRESSION

   - Paid, not refunded: retain payment amount.
   - Processed refund: subtract refund amount.
   - Missing refund amount for processed refund:
     conservatively treat as a full refund.
   - Other payment statuses: zero retained revenue.
===================================================== */

const retainedRevenueSQL = `
    CASE
        WHEN ep.refund_status = 'processed'
        THEN GREATEST(
            ep.amount - COALESCE(ep.refund_amount, ep.amount),
            0
        )

        WHEN ep.payment_status = 'paid'
        THEN ep.amount

        ELSE 0
    END
`;


/* =====================================================
   REPORTS OVERVIEW
===================================================== */

async function getReportsOverview(req, res) {
    try {
        const filters = getBookingReportFilters(req);

        const [[customerRow]] = await db.query(`
            SELECT COUNT(*) AS totalCustomers
            FROM customers
        `);

        const [[catererRow]] = await db.query(`
            SELECT COUNT(*) AS totalCaterers
            FROM caterers
        `);

        const [[bookingRow]] = await db.query(
            `
            SELECT COUNT(*) AS totalBookings
            FROM event_request er
            WHERE 1 = 1
            ${filters.sql}
            `,
            filters.params
        );

        const [[revenueRow]] = await db.query(
            `
            SELECT COALESCE(SUM(${retainedRevenueSQL}), 0)
                AS totalRevenue
            FROM event_payments ep
            INNER JOIN event_request er
                ON er.request_id = ep.request_id
            WHERE 1 = 1
            ${filters.sql}
            `,
            filters.params
        );

        const [[reviewRow]] = await db.query(`
            SELECT
                COUNT(*) AS totalReviews,
                COALESCE(ROUND(AVG(rating), 1), 0)
                    AS averageRating
            FROM reviews
        `);

        return res.status(200).json({
            totalCustomers: Number(customerRow.totalCustomers || 0),
            totalCaterers: Number(catererRow.totalCaterers || 0),
            totalBookings: Number(bookingRow.totalBookings || 0),
            totalEvents: Number(bookingRow.totalBookings || 0),
            totalRevenue: Number(revenueRow.totalRevenue || 0),
            totalReviews: Number(reviewRow.totalReviews || 0),
            averageRating: Number(reviewRow.averageRating || 0)
        });
    } catch (error) {
        console.error("Reports overview error:", error);

        return res.status(500).json({
            message: "Could not load reports overview."
        });
    }
}


/* =====================================================
   BOOKING REPORT
===================================================== */

async function getBookingReport(req, res) {
    try {
        const filters = getBookingReportFilters(req);

        const [statusRows] = await db.query(
            `
            SELECT
                status,
                COUNT(*) AS count
            FROM event_request er
            WHERE 1 = 1
            ${filters.sql}
            GROUP BY status
            `,
            filters.params
        );

        const [trendRows] = await db.query(
            `
            SELECT
                DATE(er.event_date) AS date,
                COUNT(*) AS count
            FROM event_request er
            WHERE 1 = 1
            ${filters.sql}
            GROUP BY DATE(er.event_date)
            ORDER BY date ASC
            `,
            filters.params
        );

        const statusCounts = {};

        for (const row of statusRows) {
            statusCounts[row.status] = Number(row.count || 0);
        }

        return res.status(200).json({
            statusCounts,
            statusBreakdown: statusRows,
            trend: trendRows
        });
    } catch (error) {
        console.error("Booking report error:", error);

        return res.status(500).json({
            message: "Could not load booking report."
        });
    }
}


/* =====================================================
   REVENUE AND PAYMENT REPORT
===================================================== */

async function getRevenueReport(req, res) {
    try {
        const filters = getBookingReportFilters(req);

        const [statusRows] = await db.query(
            `
            SELECT
                ep.payment_status AS status,
                COUNT(*) AS count,
                COALESCE(SUM(ep.amount), 0) AS amount,
                COALESCE(SUM(${retainedRevenueSQL}), 0)
                    AS retainedRevenue
            FROM event_payments ep
            INNER JOIN event_request er
                ON er.request_id = ep.request_id
            WHERE 1 = 1
            ${filters.sql}
            GROUP BY ep.payment_status
            `,
            filters.params
        );

        const [trendRows] = await db.query(
            `
            SELECT
                DATE(er.event_date) AS date,
                COALESCE(SUM(${retainedRevenueSQL}), 0)
                    AS revenue
            FROM event_payments ep
            INNER JOIN event_request er
                ON er.request_id = ep.request_id
            WHERE 1 = 1
            ${filters.sql}
            GROUP BY DATE(er.event_date)
            ORDER BY date ASC
            `,
            filters.params
        );

        const paymentCounts = {
            paidCount: 0,
            pendingCount: 0,
            processingCount: 0,
            failedCount: 0,
            refundedCount: 0
        };

        for (const row of statusRows) {
            const count = Number(row.count || 0);

            if (row.status === "paid") {
                paymentCounts.paidCount = count;
            } else if (row.status === "pending") {
                paymentCounts.pendingCount = count;
            } else if (row.status === "processing") {
                paymentCounts.processingCount = count;
            } else if (row.status === "failed") {
                paymentCounts.failedCount = count;
            } else if (row.status === "refunded") {
                paymentCounts.refundedCount = count;
            }
        }

        return res.status(200).json({
            ...paymentCounts,
            statusBreakdown: statusRows,
            trend: trendRows
        });
    } catch (error) {
        console.error("Revenue report error:", error);

        return res.status(500).json({
            message: "Could not load revenue report."
        });
    }
}


/* =====================================================
   CUSTOMER REPORT
===================================================== */

async function getCustomerReport(req, res) {
    try {
        const { year, month, startDate, endDate } = req.query;

        const clauses = [];
        const params = [];

        if (year && /^\d{4}$/.test(String(year))) {
            clauses.push("YEAR(created_at) = ?");
            params.push(Number(year));
        }

        if (
            month &&
            /^\d{1,2}$/.test(String(month)) &&
            Number(month) >= 1 &&
            Number(month) <= 12
        ) {
            clauses.push("MONTH(created_at) = ?");
            params.push(Number(month));
        }

        const validDate = /^\d{4}-\d{2}-\d{2}$/;

        if (startDate && validDate.test(String(startDate))) {
            clauses.push("DATE(created_at) >= ?");
            params.push(startDate);
        }

        if (endDate && validDate.test(String(endDate))) {
            clauses.push("DATE(created_at) <= ?");
            params.push(endDate);
        }

        const whereSQL = clauses.length
            ? `WHERE ${clauses.join(" AND ")}`
            : "";

        const [[summary]] = await db.query(
            `
            SELECT
                COUNT(*) AS totalCustomers,
                COALESCE(SUM(status = 'active'), 0)
                    AS activeCustomers,
                COALESCE(SUM(status = 'blocked'), 0)
                    AS blockedCustomers
            FROM customers
            ${whereSQL}
            `,
            params
        );

        const [[bookingCustomerRow]] = await db.query(`
            SELECT COUNT(DISTINCT customer_id)
                AS customersWithBookings
            FROM event_request
            WHERE customer_id IS NOT NULL
        `);

        const [registrationTrend] = await db.query(
            `
            SELECT
                DATE(created_at) AS date,
                COUNT(*) AS count
            FROM customers
            ${whereSQL}
            GROUP BY DATE(created_at)
            ORDER BY date ASC
            `,
            params
        );

        return res.status(200).json({
            summary: {
                totalCustomers: Number(summary.totalCustomers || 0),
                activeCustomers: Number(summary.activeCustomers || 0),
                blockedCustomers: Number(summary.blockedCustomers || 0),
                customersWithBookings: Number(
                    bookingCustomerRow.customersWithBookings || 0
                ),
                newCustomersLast30Days: registrationTrend.reduce(
                    (total, row) => {
                        const date = new Date(row.date);
                        const now = new Date();
                        const cutoff = new Date();
                        cutoff.setDate(now.getDate() - 30);

                        return date >= cutoff && date <= now
                            ? total + Number(row.count || 0)
                            : total;
                    },
                    0
                )
            },
            registrationTrend
        });
    } catch (error) {
        console.error("Customer report error:", error);

        return res.status(500).json({
            message: "Could not load customer report."
        });
    }
}


/* =====================================================
   CATERER APPROVAL REPORT
===================================================== */

async function getCatererReport(req, res) {
    try {
        const [[row]] = await db.query(`
            SELECT
                COUNT(*) AS totalCaterers,
                COALESCE(SUM(status = 'approved'), 0)
                    AS approvedCaterers,
                COALESCE(SUM(status = 'pending'), 0)
                    AS pendingCaterers,
                COALESCE(SUM(status = 'rejected'), 0)
                    AS rejectedCaterers
            FROM caterers
        `);

        return res.status(200).json({
            totalCaterers: Number(row.totalCaterers || 0),
            approvedCaterers: Number(row.approvedCaterers || 0),
            pendingCaterers: Number(row.pendingCaterers || 0),
            rejectedCaterers: Number(row.rejectedCaterers || 0)
        });
    } catch (error) {
        console.error("Caterer report error:", error);

        return res.status(500).json({
            message: "Could not load caterer report."
        });
    }
}


/* =====================================================
   EVENT TYPE REPORT
===================================================== */

async function getEventTypeReport(req, res) {
    try {
        const filters = getBookingReportFilters(req);

        const [rows] = await db.query(
            `
            SELECT
                er.event_type,
                COUNT(*) AS count
            FROM event_request er
            WHERE 1 = 1
            ${filters.sql}
            GROUP BY er.event_type
            ORDER BY count DESC
            `,
            filters.params
        );

        return res.status(200).json({
            eventTypes: rows
        });
    } catch (error) {
        console.error("Event type report error:", error);

        return res.status(500).json({
            message: "Could not load event type report."
        });
    }
}


/* =====================================================
   REVIEW REPORT
===================================================== */

async function getReviewReport(req, res) {
    try {
        const [distribution] = await db.query(`
            SELECT
                rating,
                COUNT(*) AS count
            FROM reviews
            GROUP BY rating
            ORDER BY rating DESC
        `);

        const [[summary]] = await db.query(`
            SELECT
                COUNT(*) AS totalReviews,
                COALESCE(ROUND(AVG(rating), 1), 0)
                    AS averageRating
            FROM reviews
        `);

        const counts = {
            fiveStar: 0,
            fourStar: 0,
            threeStar: 0,
            lowStar: 0
        };

        for (const row of distribution) {
            const rating = Number(row.rating);
            const count = Number(row.count || 0);

            if (rating === 5) counts.fiveStar = count;
            if (rating === 4) counts.fourStar = count;
            if (rating === 3) counts.threeStar = count;
            if (rating === 1 || rating === 2) {
                counts.lowStar += count;
            }
        }

        return res.status(200).json({
            totalReviews: Number(summary.totalReviews || 0),
            averageRating: Number(summary.averageRating || 0),
            ...counts,
            distribution
        });
    } catch (error) {
        console.error("Review report error:", error);

        return res.status(500).json({
            message: "Could not load review report."
        });
    }
}


/* =====================================================
   CATERER PERFORMANCE REPORT
===================================================== */

async function getCatererPerformance(req, res) {
    try {
        const bookingFilters = getBookingReportFilters(req);
        const revenueFilters = getBookingReportFilters(req, "er2");

        // Map test booking emails to their correct caterer IDs.
        const catererEmailMap = {
            "saraswathi.test@gmail.com": 60,
            "meenakshi.test@gmail.com": 61,
            "royal.test@gmail.com": 62,
            "lakshmi.test@gmail.com": 63,
            "naveen.test@gmail.com": 64,
            "farhan.test@gmail.com": 65,
            "bengaluru.royal.test@gmail.com": 66,
            "annapoorna.test@gmail.com": 67,
            "greenleaf.test@gmail.com": 68,
            "royalfeast.test@gmail.com": 69
        };

        const emailMappingSQL = `
            CASE LOWER(TRIM(caterer_email))
                WHEN 'saraswathi.test@gmail.com' THEN 60
                WHEN 'meenakshi.test@gmail.com' THEN 61
                WHEN 'royal.test@gmail.com' THEN 62
                WHEN 'lakshmi.test@gmail.com' THEN 63
                WHEN 'naveen.test@gmail.com' THEN 64
                WHEN 'farhan.test@gmail.com' THEN 65
                WHEN 'bengaluru.royal.test@gmail.com' THEN 66
                WHEN 'annapoorna.test@gmail.com' THEN 67
                WHEN 'greenleaf.test@gmail.com' THEN 68
                WHEN 'royalfeast.test@gmail.com' THEN 69
                ELSE NULL
            END
        `;

        const query = `
            SELECT
                c.caterer_id,
                c.brand_name,
                c.head_name,
                c.email,
                c.status,

                COALESCE(b.requests, 0) AS requests,
                COALESCE(b.confirmed, 0) AS confirmed,
                COALESCE(b.completed, 0) AS completed,

                COALESCE(r.reviews, 0) AS reviews,
                COALESCE(r.rating, 0) AS rating,

                COALESCE(rv.totalRevenue, 0) AS totalRevenue

            FROM caterers c

            LEFT JOIN (
                SELECT
                    ${emailMappingSQL} AS mapped_caterer_id,
                    COUNT(*) AS requests,
                    SUM(er.status = 'confirmed') AS confirmed,
                    SUM(er.status = 'completed') AS completed
                FROM event_request er
                WHERE 1 = 1
                ${bookingFilters.sql}
                GROUP BY mapped_caterer_id
            ) b
                ON b.mapped_caterer_id = c.caterer_id

            LEFT JOIN (
                SELECT
                    caterer_id,
                    COUNT(*) AS reviews,
                    ROUND(AVG(rating), 1) AS rating
                FROM reviews
                GROUP BY caterer_id
            ) r
                ON r.caterer_id = c.caterer_id

            LEFT JOIN (
                SELECT
                    ${emailMappingSQL.replaceAll("caterer_email", "er2.caterer_email")} AS mapped_caterer_id,
                    SUM(${retainedRevenueSQL}) AS totalRevenue
                FROM event_payments ep
                INNER JOIN event_request er2
                    ON er2.request_id = ep.request_id
                WHERE 1 = 1
                ${revenueFilters.sql}
                GROUP BY mapped_caterer_id
            ) rv
                ON rv.mapped_caterer_id = c.caterer_id

            ORDER BY requests DESC, c.brand_name ASC
        `;

        const [rows] = await db.query(query, [
            ...bookingFilters.params,
            ...revenueFilters.params
        ]);

        return res.status(200).json({
            performance: rows
        });

    } catch (error) {
        console.error("Caterer performance error:", error);

        return res.status(500).json({
            message: "Could not load caterer performance."
        });
    }
}


// =====================================================
// BOOKING STATUS MANAGEMENT
// =====================================================

async function updateBookingStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "accepted",
            "payment_pending",
            "confirmed",
            "completed",
            "rejected"
        ];

        if (!id || !/^\d+$/.test(String(id))) {
            return res.status(400).json({
                message: "A valid booking ID is required."
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid booking status."
            });
        }

        // Check that the booking exists.
        const [bookings] = await db.query(
            "SELECT request_id FROM event_request WHERE request_id = ?",
            [id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                message: "Booking not found."
            });
        }

        // Update the booking status in MySQL.
        await db.query(
            "UPDATE event_request SET status = ? WHERE request_id = ?",
            [status, id]
        );

        return res.status(200).json({
            message: "Booking status updated successfully.",
            requestId: Number(id),
            status
        });

    } catch (error) {
        console.error("Update booking status error:", error);

        return res.status(500).json({
            message: "Could not update booking status."
        });
    }
}


 module.exports = {
    login,
    changeAdminPassword,

    listCaterers,
    updateCatererStatus,

    getCustomerSummary,
    listCustomers,
    getCustomerDetails,
    updateCustomerStatus,

    getPaymentSummary,
    listPayments,
    getPaymentDetails,

    getReviewSummary,
    listReviews,
    getReviewDetails,
    getSentimentAnalysis,

    getReportsOverview,
    getBookingReport,
    getRevenueReport,
    getCustomerReport,
    getCatererReport,
    getEventTypeReport,
    getReviewReport,
    getCatererPerformance
};