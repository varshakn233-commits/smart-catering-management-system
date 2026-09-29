const express = require("express");

const router = express.Router();

const {
    createRequest,
    getCustomerRequests,
    getRequests,
    getCatererEvents,
    updateRequestStatus
} = require("../controllers/eventRequestController");


// =====================================================
// CUSTOMER - CREATE EVENT REQUEST
// POST /api/requests
// =====================================================

router.post("/", createRequest);


// =====================================================
// CUSTOMER - GET THEIR REQUESTS
// GET /api/requests/customer/:customerId
// =====================================================

router.get(
    "/customer/:customerId",
    getCustomerRequests
);


// =====================================================
// CATERER - GET EVENTS
// IMPORTANT:
// This route MUST come before /caterer/:catererEmail
// =====================================================

router.get(
    "/caterer/:catererEmail/events",
    getCatererEvents
);


// =====================================================
// CATERER - GET REQUESTS USING QUERY EMAIL
//
// GET /api/requests/caterer?email=caterer@gmail.com
// GET /api/requests/caterer?catererEmail=caterer@gmail.com
// =====================================================

router.get(
    "/caterer",
    (req, res) => {

        const email =
            req.query.catererEmail ||
            req.query.email;

        if (!email) {

            return res.status(400).json({
                success: false,
                message: "Caterer email is required"
            });

        }

        req.query.catererEmail = email;

        return getRequests(req, res);
    }
);


// =====================================================
// CATERER - GET REQUESTS USING EMAIL IN URL
//
// GET /api/requests/caterer/caterer@gmail.com
// =====================================================

router.get(
    "/caterer/:catererEmail",
    (req, res) => {

        req.query.catererEmail =
            req.params.catererEmail;

        return getRequests(req, res);
    }
);


// =====================================================
// GET ALL REQUESTS
// GET /api/requests
// =====================================================

router.get(
    "/",
    getRequests
);


// =====================================================
// ACCEPT / REJECT REQUEST
//
// PUT /api/requests/:id/status
//
// Example body:
// {
//     "status": "accepted"
// }
// =====================================================

router.put(
    "/:id/status",
    updateRequestStatus
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;