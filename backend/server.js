require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const customerAuthRoutes = require("./routes/customerAuthRoutes");
const catererAuthRoutes = require("./routes/catererAuthRoutes");
const adminRoutes = require("./routes/adminRoutes");
const eventRequestRoutes = require("./routes/eventRequestRoutes");
const customerCatererRoutes = require("./routes/customerCatererRoutes");
const savedCatererRoutes = require("./routes/savedCatererRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const trackingRoutes = require("./routes/trackingRoutes");

const app = express();


/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(cors());

app.use(express.json());


/* =====================================================
   SERVE FRONTEND FILES
===================================================== */

// Project root folder
// server.js is inside: project/backend/
// So ".." points to: project/

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);


/* =====================================================
   API ROUTES
===================================================== */

app.use(
    "/api/customer",
    customerAuthRoutes
);

app.use(
    "/api/caterer",
    catererAuthRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/requests",
    eventRequestRoutes
);

app.use(
    "/api/customer/saved-caterers",
    savedCatererRoutes
);

app.use(
    "/api/customer/caterers",
    customerCatererRoutes
);

app.use(
    "/api/customer/reviews",
    reviewRoutes
);

app.use(
    "/api/payment",
    paymentRoutes
);

app.use(
    "/api/tracking",
    trackingRoutes
);


/* =====================================================
   TEST ROUTE
===================================================== */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "..",
            "index.html"
        )
    );

});


/* =====================================================
   START SERVER
===================================================== */

const PORT =
    process.env.PORT || 5000;


app.listen(PORT, () => {

    console.log(
        `🚀 Server running on http://localhost:${PORT}`
    );

});