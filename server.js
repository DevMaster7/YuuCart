const express = require("express");
const dbConnection = require("./config/db");
require("dotenv").config();

const app = express();
dbConnection();

app.get("/", (req, res) => res.send("QuickCart is running! ✅"));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
