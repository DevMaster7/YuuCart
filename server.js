const express = require("express");
const userRouter = require("./routes/user.routes");
const adminRouter = require("./routes/admin.routes");
const dbConnection = require("./config/db");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const env = require("dotenv");
const app = express();

env.config();
dbConnection()

app.use(express.static("public"));
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.render("home");
})

app.use("/", userRouter)
app.use("/admin", adminRouter);


app.listen(3000, () => {
    console.log("Server is running on port 3000");
})