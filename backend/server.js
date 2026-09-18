require("dotenv").config();

const express = require("express");
const cors = require("cors");

const customerAuthRoutes = require("./routes/customerAuthRoutes");
const catererAuthRoutes = require("./routes/catererAuthRoutes");
const adminRoutes = require("./routes/adminRoutes");
const eventRequestRoutes = require("./routes/eventRequestRoutes");

const app = express();

// ---------- Middleware ----------
app.use(cors());

app.use(express.json());

// ---------- Authentication Routes ----------
app.use("/api/customer", customerAuthRoutes);
app.use("/api/caterer", catererAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/requests", eventRequestRoutes);

// ---------- Test Route ----------
app.get("/", (req, res) => {
    res.send("Annapriya backend is running!");
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});