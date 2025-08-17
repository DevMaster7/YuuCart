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
let bcrypt = require("bcrypt");
const env = require("dotenv");
const flash = require("connect-flash");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = require("./routes/admin.routes");
const app = express();

require("./auth/google");

env.config();
dbConnection()
app.use(session({
  secret: "yourSecretKey",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(cookieParser())
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.get("/", optionalVerifyToken, async (req, res) => {
  const tokenUser = req.user;
  if (!tokenUser) {
    return res.render("home", { user: [] });
  }
  const user = await userModel.findById(tokenUser._QCUI_UI);
  res.render("home", { user });
})
app.get("/auth/google/register",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent", // Get premission also
    // prompt: "select_account", // Select account only
    state: "register"
  })
);
app.get("/auth/google/login",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    // prompt: "consent", // Get premission also
    prompt: "select_account", // Select account only
    state: "login"
  })
);
app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    const data = req.user;
    const user = await userModel.findOne({ email: data.emails[0].value });
    const action = req.query.state;
    if (action == "register") {
      if (!user) {
        function usernameFromEmail(email) {
          return email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
        }
        let userData = {
          userImg: data.photos[0].value,
          fullname: data.displayName,
          provider: data.provider,
          username: usernameFromEmail(data.emails[0].value),
          email: data.emails[0].value
        }
        req.session.userData = userData;
        req.flash("success", "enter-pass");
        return res.redirect("/user/register");
      }
      else {
        res.redirect("/user/login");
      }
    } else if (action == "login") {
      if (user) {
        const token = jwt.sign({
          _QCUI_UI: user._id,
        }, process.env.SECRET_KEY, {
          expiresIn: "12h"
        });

        res.cookie("ULGG", token);
        if (user.isAdmin) {
          res.redirect("/admin");
        } else {
          res.redirect("/shop");
        }
      }
      else {
        res.redirect("/user/register");
      }
    }
  }
);
app.post("/user/register/enterpass", async (req, res) => {
  const userData = req.session.userData;
  const { password, confirmPassword } = req.body;
  if (password.length < 8) {
    return res.status(400).json({ message: "Password is too short!" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match!" });
  }
  const hashPassword = await bcrypt.hash(password, 10);
  userData.password = hashPassword;
  await userModel.create(userData);
  console.log(password,confirmPassword);
  delete req.session.userData;
  return res.status(200).json({ success: true, message: "Password set successfully!" });
})
app.get("/terms-and-conditions", (req, res) => {
  res.render("terms");
})
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/shop", shopRouter);

// Page Not Found
app.use((req, res) => {
  res.status(404).render("PNF");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
})