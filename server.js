const express = require("express");
const userRouter = require("./routes/user.routes");
const adminRouter = require("./routes/admin.routes");
const shopRouter = require("./routes/shop.routes")
const dbConnection = require("./config/db");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const optionalVerifyToken = require("./middleware/optionalVerifyToken");
const userModel = require("./models/usersModel");
const morgan = require("morgan");
const env = require("dotenv");
const jwt = require("jsonwebtoken");
const app = express();

env.config();
dbConnection()
app.use(session({
  secret: "yourSecretKey",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(cookieParser())
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(morgan("dev"));

app.get("/", optionalVerifyToken, async (req, res) => {
  const tokenUser = req.user;
  if (!tokenUser) {
    return res.render("home", { user: [] });
  }
  const user = await userModel.findById(tokenUser._QCUI_UI);
  res.render("home", { user });
})

app.get("/terms-and-conditions", (req, res) => {
  res.render("terms");
})

app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/shop", shopRouter);

app.use((req, res) => {
  res.status(404).render("PNF");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
})