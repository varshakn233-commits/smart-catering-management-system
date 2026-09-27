const jwt = require("jsonwebtoken");

function verifyCustomerToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Customer token is missing."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Customer login token contains customerId
        if (!decoded.customerId) {
            return res.status(403).json({
                message: "Customer access denied."
            });
        }

        req.user = decoded;

        next();

    } catch (error) {
        console.error(
            "Customer token verification error:",
            error
        );

        return res.status(401).json({
            message: "Invalid or expired customer token."
        });
    }
}

module.exports = verifyCustomerToken;