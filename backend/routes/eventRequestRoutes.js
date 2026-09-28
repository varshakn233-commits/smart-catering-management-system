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
// =====================================================

router.post(
    "/",
    createRequest
);


// =====================================================
// CUSTOMER - GET OWN REQUESTS
// =====================================================

router.get(
    "/customer/:customerId",
    getCustomerRequests
);


// =====================================================
// CATERER - GET EVENT REQUESTS
// =====================================================
// Supports:
// /api/requests/caterer/caterer@gmail.com
//
// Internally uses getRequests(), which filters by
// catererEmail.
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
// CATERER - GET ACCEPTED / ACTIVE EVENTS
// =====================================================

router.get(
    "/caterer/:catererEmail/events",
    getCatererEvents
);


// =====================================================
// ALL REQUESTS
// =====================================================

router.get(
    "/",
    getRequests
);


// =====================================================
// UPDATE REQUEST STATUS
// =====================================================

router.put(
    "/:id/status",
    updateRequestStatus
);


module.exports = router;