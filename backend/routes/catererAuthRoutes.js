const express = require("express");

const router = express.Router();

const {
    signup,
    login,
    getCatererProfile,
    updateCatererProfile,
    changeCatererPassword
} = require("../controllers/catererAuthcontroller");


// =====================================================
// CATERER SIGNUP
// =====================================================

router.post(
    "/signup",
    signup
);


// =====================================================
// CATERER LOGIN
// =====================================================

router.post(
    "/login",
    login
);


// =====================================================
// GET CATERER PROFILE
// =====================================================

router.get(
    "/profile/:catererId",
    getCatererProfile
);


// =====================================================
// UPDATE CATERER PROFILE
// =====================================================

router.put(
    "/profile/:catererId",
    updateCatererProfile
);


// =====================================================
// CHANGE CATERER PASSWORD
// =====================================================

router.put(
    "/change-password/:catererId",
    changeCatererPassword
);


module.exports = router;