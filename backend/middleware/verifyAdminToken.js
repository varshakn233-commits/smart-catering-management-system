const jwt = require("jsonwebtoken");

function verifyAdminToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Admin token is missing."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.role !== "admin") {
            return res.status(403).json({
                message: "Admin access denied."
            });
        }

        req.admin = decoded;

        next();

    } catch (error) {
        console.error("Admin token verification error:", error);

        return res.status(401).json({
            message: "Invalid or expired admin token."
        });
    }
}

module.exports = verifyAdminToken;