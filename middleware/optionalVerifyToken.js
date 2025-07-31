const jwt = require("jsonwebtoken");

function optionalVerifyToken(req, res, next) {
    const token = req.cookies.ULGG;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
    } catch (err) {
        console.error("Token error:", err);
        req.user = null;
    }

    next();
}

module.exports = optionalVerifyToken;