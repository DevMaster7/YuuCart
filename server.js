const express = require("express");
const userRouter = require("./routes/user.routes");
const adminRouter = require("./routes/admin.routes");
const shopRouter = require("./routes/shop.routes")
const dbConnection = require("./config/db");
const cookieParser = require("cookie-parser");
const sendEmail = require("./utils/sendOTP");
const session = require("express-session");
const optionalVerifyToken = require("./middleware/optionalVerifyToken");
const userModel = require("./models/usersModel");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const env = require("dotenv");
const flash = require("connect-flash");
const passport = require("passport");
const { uploadUrlOnCloudinary } = require("./config/cloudinary");
const jwt = require("jsonwebtoken");
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
app.use((req, res, next) => {
  next();
})

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
        let img = await uploadUrlOnCloudinary(data.photos[0].value, "profile_pics");
        function usernameFromEmail(email) {
          return email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
        }
        let userData = {
          userImg: img,
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
        const token = jwt.sign(
          { _QCUI_UI: user._id },
          process.env.SECRET_KEY,
          { expiresIn: "2m" }
        );

        res.cookie("ULGG", token, {
          // httpOnly: true,
          // secure: true,
          maxAge: 120 * 1000
        });
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
  // console.log(password, confirmPassword);
  delete req.session.userData;
  return res.status(200).json({ success: true, message: "Password set successfully!" });
})
app.post("/verify-captcha", async (req, res) => {
  const { email, cap_token } = req.body;
  let user = await userModel.findOne({ email: email })
  if (!user) {
    return res.status(400).json({ success: false, message: "User not found!" });
  }
  if (!cap_token) {
    return res.status(400).json({ success: false, message: "Please verify captcha!" });
  }
  req.session.captchaVerification = cap_token;
  res.status(200).json({ success: true, message: "All good" });
})
app.get("/sendmail/forgot-password", optionalVerifyToken, async (req, res) => {
  function generateVerificationCode() {
    const digits = "0123456789";
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let codeArr = [];
    for (let i = 0; i < 3; i++) {
      codeArr.push(digits.charAt(Math.floor(Math.random() * digits.length)));
    }
    for (let i = 0; i < 3; i++) {
      codeArr.push(letters.charAt(Math.floor(Math.random() * letters.length)));
    }
    for (let i = codeArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [codeArr[i], codeArr[j]] = [codeArr[j], codeArr[i]];
    }
    return codeArr.join("");
  }
  const verificationCode = generateVerificationCode();
  if (req.session.captchaVerification == undefined) return res.redirect("/user/login");
  const email = req.query.email;
  const location = req.query.location;
  if (!email) return res.redirect("/user/login");
  const user = await userModel.findOne({ email: email });
  if (!user) return res.redirect("/user/login");
  let expiresAt = new Date(Date.now() + 1 * 60 * 1000);
  await userModel.updateOne({ email: email }, {
    $set: {
      verificationOTP: {
        email: email,
        otp: verificationCode,
        expiresAt,
        location
      }
    }
  })
  const html = `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 20px 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p style="font-size: 16px; color: #555;">
        Hi ${user.fullname},
      </p>
      <p style="font-size: 16px; color: #555;">
        We received a request to reset your password for your <strong>QuickCart</strong> account.  
        Please use the one-time code below to proceed:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 5px;">${verificationCode}</span>
      </div>
      <p style="font-size: 14px; color: #888;">
        This code is valid for the next 5 minutes. If you did not request a password reset, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        &copy; ${new Date().getFullYear()} QuickCart. All rights reserved.
      </p>
    </div>
  </div>`
  await sendEmail(email, html);
  delete req.session.captchaVerification;
  res.render("verify", { email, expiresAt });
})
app.post("/verify-otp", optionalVerifyToken, async (req, res) => {
  const inputOTP = req.body.otp;
  const email = req.body.email;

  if (!email) return res.status(400).json({ success: false, message: "User not found!" });
  delete req.session.email;
  req.session.email = email;
  const user = await userModel.findOne({ email: email });
  if (!user) return res.status(400).json({ success: false, message: "User not found!" });

  if (user.verificationOTP.otp !== inputOTP) return res.status(400).json({ success: false, message: "Invalid OTP!" });
  if (user.verificationOTP.expiresAt < Date.now()) {
    await userModel.updateOne(
      { email: email },
      { $unset: { verificationOTP: "" } }
    );
    return res.status(400).json({ success: false, message: "OTP has expired!" });
  }
  if (user.verificationOTP.otp === inputOTP) {
    req.flash("success", "enter-pass");
    if (user.verificationOTP.location == "user") {
      res.status(200).json({ success: true, redirectTo: "/user/account", message: "OTP verified!" });
    }
    else {
      res.status(200).json({ success: true, redirectTo: "/user/login", message: "OTP verified!" });
    }
    await userModel.updateOne(
      { email: email },
      { $unset: { verificationOTP: "" } }
    );
  }
})
app.post("/set-new-forgot", optionalVerifyToken, async (req, res) => {
  const { password, confirmPassword } = req.body;
  console.log(password, confirmPassword);
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match!" });
  }
  const email = req.session.email;
  console.log(email);
  if (!email) return res.status(400).json({ success: false, message: "User not found!" });
  const user = await userModel.findOne({ email: email });
  if (!user) return res.status(400).json({ success: false, message: "User not found!" });
  const hashPassword = await bcrypt.hash(password, 10);
  user.password = hashPassword;
  await user.save();
  delete req.session.email;
  res.status(200).json({ success: true, message: "Password set successfully!" })
})

// Policies and etc...
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