
const express = require("express");
const { execFile } = require("child_process");
const path = require("path");

const verifyCustomerToken = require("../middleware/verifyCustomerToken");

const router = express.Router();

const recommendationScript = path.join(
    __dirname,
    "..",
    "..",
    "ml",
    "recommend.py"
);

router.get("/", verifyCustomerToken, (req, res) => {
    const customerId = Number(req.user.customerId);

    if (!Number.isInteger(customerId) || customerId <= 0) {
        return res.status(401).json({
            error: "Invalid customer identity."
        });
    }

    const pythonCommand =
        process.env.PYTHON_EXECUTABLE || "python";

    execFile(
        pythonCommand,
        [recommendationScript, String(customerId)],
        {
            timeout: 20000,
            maxBuffer: 1024 * 1024,
            windowsHide: true
        },
        (error, stdout, stderr) => {
            if (error) {
                console.error(
                    "Recommendation process failed:",
                    error.message
                );
                console.error("Python stderr:", stderr);
                console.error("Python stdout:", stdout);

                return res.status(503).json({
                    error: "Recommendation service is temporarily unavailable."
                });
            }

            let result;

            try {
                result = JSON.parse(stdout.trim());
            } catch (parseError) {
                console.error(
                    "Recommendation output could not be parsed:",
                    parseError.message
                );
                console.error("Python stdout:", stdout);
                console.error("Python stderr:", stderr);

                return res.status(500).json({
                    error: "Unable to generate recommendations."
                });
            }

            if (result.error) {
                console.error(
                    "Recommendation error:",
                    result.error
                );

                const statusCode =
                    result.error === "Customer not found."
                        ? 404
                        : 503;

                return res.status(statusCode).json(result);
            }

            return res.json(result);
        }
    );
});

module.exports = router;
