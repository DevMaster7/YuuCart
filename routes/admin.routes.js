const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/verifyAdmin");

router.get("/dashboard", verifyAdmin, (req, res) => {
  res.render("admin");
});

module.exports = router;
