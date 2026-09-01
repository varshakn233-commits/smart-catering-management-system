const express = require("express");
const router = express.Router();
const { login, listCaterers, updateCatererStatus } = require("../controllers/adminController");
const verifyAdminToken = require("../middleware/verifyAdminToken");

router.post("/login", login);
router.get("/caterers", verifyAdminToken, listCaterers);
router.put("/caterers/:id/status", verifyAdminToken, updateCatererStatus);

module.exports = router;