const express = require("express");

const router = express.Router();

const {
    sendAdminMessageToCaterer,
    getCatererMessages,
    markMessageAsRead
} = require("../controllers/adminCatererMessageController");

const verifyAdminToken =
    require("../middleware/verifyAdminToken");


// =====================================================
// ADMIN → CATERER
// SEND MESSAGE
// =====================================================

router.post(
    "/",
    verifyAdminToken,
    sendAdminMessageToCaterer
);


// =====================================================
// CATERER
// GET MESSAGES
// =====================================================

router.get(
    "/caterer/:catererId",
    getCatererMessages
);


// =====================================================
// CATERER
// MARK MESSAGE AS READ
// =====================================================

router.put(
    "/:id/read",
    markMessageAsRead
);


module.exports = router;