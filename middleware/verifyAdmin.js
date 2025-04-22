const jwt = require("jsonwebtoken");

function verifyAdmin(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded.isAdmin) return res.status(403).send("Access denied");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send("Invalid token");
  }
}

module.exports = verifyAdmin;
