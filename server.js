require("dotenv").config();

const express = require("express");
const cors = require("cors");

const customerAuthRoutes = require("./routes/customerAuthRoutes");

const app = express();


app.use(cors());

app.use(express.json());


app.use("/api/customer", customerAuthRoutes);


app.get("/", (req, res) => {
    res.send("Customer backend is running!");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});