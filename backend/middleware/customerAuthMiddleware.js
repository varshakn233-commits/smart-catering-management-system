const jwt = require("jsonwebtoken");


// =====================================================
// CUSTOMER AUTHENTICATION MIDDLEWARE
// =====================================================

function customerAuthMiddleware(req, res, next) {

    try {

        // Get Authorization header
        const authHeader =
            req.headers.authorization;


        // Check whether token exists
        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({
                message:
                    "Authentication required. Please login again."
            });

        }


        // Extract token
        const token =
            authHeader.split(" ")[1];


        if (!token) {

            return res.status(401).json({
                message:
                    "Authentication token is missing."
            });

        }


        // Verify JWT
        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // Store decoded customer information
        // inside req.user
        req.user = decoded;


        // Continue to controller
        next();


    } catch (error) {

        console.error(
            "Customer authentication error:",
            error.message
        );


        return res.status(401).json({
            message:
                "Session expired. Please login again."
        });

    }
}


module.exports =
    customerAuthMiddleware;