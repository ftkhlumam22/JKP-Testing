const jwt = require("jsonwebtoken");

/**
 * JWT Auth Validation.
 * 
 * @param {string}      token
 */
module.exports = function(req, res, next) {
    /* Cek Apakah Ada Token atau tidak */
    const token = req.header("token");
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    /* Verifikasi Token dengan JWT */
    try {
        const decoded = jwt.verify(token, "randomString");
        req.user = decoded.user;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Invalid Token" });
    }
}