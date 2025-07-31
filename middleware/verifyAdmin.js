const jwt = require("jsonwebtoken");
const userModel = require("../models/usersModel");

async function verifyAdmin(req, res, next) {
  const token = req.cookies.ULGG;
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const newUser = await userModel.findById(decoded._QCUI_UI);
    if (!newUser.isAdmin) return res.status(403).render("PNF");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).render("PNF");
  }
}

module.exports = verifyAdmin;
