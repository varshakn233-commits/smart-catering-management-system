const express = require("express");

const router = express.Router();

const {
    createComplaint,
    getAllComplaints,
    getComplaintById,
    updateComplaintStatus,
    updateComplaintPriority,
    replyToComplaint
} = require("../controllers/complaintController");


// =====================================================
// CUSTOMER — SUBMIT COMPLAINT
// =====================================================

router.post(
    "/",
    createComplaint
);


// =====================================================
// ADMIN — GET ALL COMPLAINTS
// =====================================================

router.get(
    "/",
    getAllComplaints
);


// =====================================================
// ADMIN — GET SINGLE COMPLAINT
// =====================================================

router.get(
    "/:id",
    getComplaintById
);


// =====================================================
// ADMIN — UPDATE COMPLAINT STATUS
// =====================================================

router.put(
    "/:id/status",
    updateComplaintStatus
);


// =====================================================
// ADMIN — UPDATE COMPLAINT PRIORITY
// =====================================================

router.put(
    "/:id/priority",
    updateComplaintPriority
);


// =====================================================
// ADMIN — REPLY TO COMPLAINT
// =====================================================

router.put(
    "/:id/reply",
    replyToComplaint
);


module.exports = router;