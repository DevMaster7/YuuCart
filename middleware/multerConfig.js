const multer = require("multer");

// store in memory instead of writing to disk
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
