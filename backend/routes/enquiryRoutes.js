const express = require("express");

const router = express.Router();

const {
    createEnquiry,
    getCustomerEnquiries,
    getCatererEnquiries,
    replyToEnquiry,
    markEnquiryBookingCreated
} = require("../controllers/enquiryController");


/* =====================================================
   CUSTOMER - SEND ENQUIRY
===================================================== */

router.post("/", createEnquiry);


/* =====================================================
   CUSTOMER - GET THEIR ENQUIRIES
===================================================== */

router.get(
    "/customer/:customerId",
    getCustomerEnquiries
);


/* =====================================================
   CATERER - GET CUSTOMER ENQUIRIES
===================================================== */

router.get(
    "/caterer",
    getCatererEnquiries
);


/* =====================================================
   CATERER - REPLY TO ENQUIRY
===================================================== */

router.put(
    "/:id/reply",
    replyToEnquiry
);


/* =====================================================
   MARK ENQUIRY AS BOOKING CREATED
===================================================== */

router.put(
    "/:id/booking-created",
    markEnquiryBookingCreated
);


module.exports = router;
