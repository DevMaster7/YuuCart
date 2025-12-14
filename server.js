const express = require("express");
const userRouter = require("./routes/user.routes");
const adminRouter = require("./routes/admin.routes");
const shopRouter = require("./routes/shop.routes");
const addonsRouter = require("./routes/addons.routes");
const apiRouter = require("./routes/api.routes");
const dbConnection = require("./config/db");
const cookieParser = require("cookie-parser");
const sendEmail = require("./utils/sendOTP");
const session = require("express-session");
const optionalVerifyToken = require("./middleware/optionalVerifyToken");
const userModel = require("./models/usersModel");
const productModel = require("./models/productsModel");
const categoriesModel = require("./models/categoriesModel");
const orderModel = require("./models/ordersModel");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const env = require("dotenv");
const flash = require("connect-flash");
const passport = require("passport");
const { uploadImageFromUrl } = require("./config/cloudinary");
const jwt = require("jsonwebtoken");
const app = express();

require("./auth/google");

env.config();
dbConnection()
app.use(session({
  secret: "yourSecretKey",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // production me Railway HTTPS hai → secure: true
}));
app.locals.RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY;
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
  // let result = await userModel.updateMany(
  //   {},
  //   {
  //     $set: {
  //       "allowed": {
  //         manageProducts: false,
  //         manageCoupons: false,
  //         manageOrders: false,
  //         manageUsers: false,
  //         manageCategories: false
  //       },
  //     }
  //   }
  // );
  // console.log(result);

  // const result = await categoriesModel.updateMany(
  //   {}, // all documents
  //   [
  //     {
  //       $set: {
  //         categoryName: { $trim: { input: "$categoryName" } },
  //         subCategories: {
  //           $map: {
  //             input: "$subCategories",
  //             as: "sub",
  //             in: {
  //               $mergeObjects: [
  //                 "$$sub",
  //                 { subName: { $trim: { input: "$$sub.subName" } } }
  //               ]
  //             }
  //           }
  //         }
  //       }
  //     }
  //   ]
  // );
  // console.log(result);

  // const products = await productModel.find({});
  // for (const product of products) {
  //   await productModel.updateOne({ $set: { "product.proPrice": product.proOrignalPrice, } });
  // }
  //   // Step 1: Remove all existing messages
  //   await userModel.updateOne(
  //     { _id: use._id },
  //     { $unset: { messages: "" } }
  //   );

  //   // Step 2: Add the new welcome message
  //   await userModel.updateOne(
  //     { _id: use._id },
  //     {
  //       $push: {
  //         messages: {
  //           textContent: `Assalam o Alaikum, <strong style="color:#FB8500;">${use.fullname}</strong>!<br>
  //             Welcome to <strong style="color:#FB8500;">YuuCart</strong><br>
  //             We’re delighted to have you join our community!<br>
  //             Explore, shop, and enjoy a seamless experience — we hope you’ll love everything we have to offer.<br><br>
  //             <strong>With Warm Regards,</strong><br>
  //             &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong style="color:#FB8500;">The YuuTeam</strong>`,
  //           sendingDate: use.joiningDate,
  //           seen: true
  //         }
  //       }
  //     }
  //   );
  // }

  // console.log("Success! ✅");


  const tokenUser = req.user;
  if (!tokenUser) {
    return res.render("home", { user: [] });
  }
  const user = await userModel.findById(tokenUser._QCUI_UI);

  res.render("home", { user });
});
app.get("/auth/google/register", (req, res, next) => {
  const stateDataReg = JSON.stringify({
    action: "register",
    Reffer: req.session.reffer
  });
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent",
    state: encodeURIComponent(stateDataReg)
  })(req, res, next);
});
app.get("/auth/google/login", (req, res, next) => {
  const stateDataLog = JSON.stringify({
    action: "login",
  });
  passport.authenticate("google", {
    scope: ["profile", "email"],
    // prompt: "consent", // Get premission also
    prompt: "select_account", // Select account only
    state: encodeURIComponent(stateDataLog)
  })(req, res, next);
});
app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    const data = req.user;
    const user = await userModel.findOne({ email: data.emails[0].value });
    const state = JSON.parse(decodeURIComponent(req.query.state));
    const action = state.action;

    if (action == "register") {
      const Reffer = state.Reffer;
      if (!user) {
        let img = await uploadImageFromUrl(data.photos[0].value, "profile_pics");

        // Email to Username
        function usernameFromEmail(email) {
          return email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
        }
        const username = usernameFromEmail(data.emails[0].value)

        const joiningDate = new Date();

        let userData = {
          joiningDate,
          userImg: img,
          fullname: data.displayName,
          provider: data.provider,
          username,
          email: data.emails[0].value,
          Reffer,
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
          { expiresIn: "24h" }
        );

        res.cookie("ULGG", token, {
          // httpOnly: true,
          // secure: true,
          maxAge: 24 * 60 * 60 * 1000
        });

        // ----For Testing----
        // const token = jwt.sign(
        //   { _QCUI_UI: user._id },
        //   process.env.SECRET_KEY,
        //   { expiresIn: "2m" }
        // );

        // res.cookie("ULGG", token, {
        //   // httpOnly: true,
        //   // secure: true,
        //   maxAge: 120 * 1000
        // });
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

  let Reffer = userData.Reffer;
  let from = "";
  let accept = null;
  if (Reffer) {
    from = Reffer.from;
    accept = Reffer.status
  }

  await userModel.create({
    joiningDate: userData.joiningDate,
    userImg: userData.userImg,
    fullname: userData.fullname,
    provider: userData.provider,
    username: userData.username,
    email: userData.email,
    password: userData.password,
    Reffer: {
      from,
      Status: accept,
      refferCode: userData.username,
      url: `${process.env.BASE_URL}/user/register?reffer=${userData.username}`,
    },
    messages: [{
      textContent: `Assalam o Alaikum, <strong style="color:#FB8500;">${userData.fullname}!</strong><br>
            Welcome to <strong style="color:#FB8500;">YuuCart</strong><br>
            We’re delighted to have you join our community!<br>
            Explore, shop, and enjoy a seamless experience — we hope you’ll love everything we have to offer.<br><br>
            <strong>With Warm Regards,</strong><br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong style="color:#FB8500;">The YuuTeam</strong>`,
      sendingDate: new Date(),
      seen: true
    }],
  });

  // if (Reffer) {
  //   const refferUser = await userModel.findOne({ username: Reffer.from });
  //   const newUser = await userModel.findOne({ username: userData.username });
  //   if (Reffer.status) {
  //     // console.log(`True FriendShip`);
  //     let msg = {
  //       textContent: `Well, well… someone actually joined through the link! <br>
  //               Unlike the ones who sold out for our <strong>100Yuu</strong> coins, your friend <strong style="color:#FB8500;">${userData.username}</strong> just proved that friendship still exists in this economy.<br>
  //               Loyalty level: Premium 💙`,
  //       sendingDate: new Date(),
  //       seen: true
  //     }
  //     refferUser.YuuCoin += 100;
  //     refferUser.Yuutx.push({ desc: "Referral Bonus", Yuu: 100 });
  //     refferUser.Reffer.yourReffers.push(userData.username);
  //     refferUser.messages.push(msg);
  //     await refferUser.save();

  //     let newMsg = {
  //       textContent: `Well, well… someone actually joined through the link! <br>
  //               Unlike the ones who sold out for our <strong>100Yuu</strong> coins, you just proved that friendship still exists in this economy.<br>
  //               Loyalty level: Premium 💙`,
  //       sendingDate: new Date(),
  //       seen: true
  //     }
  //     newUser.messages.push(newMsg);
  //     await newUser.save();
  //   }
  //   else if (!Reffer.status) {
  //     // console.log(`LoL Fake FriendShip`);
  //     newUser.YuuCoin += 100;
  //     newUser.Yuutx.push({ desc: "Betray Bonus", Yuu: 100 });
  //     await newUser.save();

  //     let msg = {
  //       textContent: `
  //       It appears that your friend just reject your referral link — all for <strong>100Yuu</strong> coins. <br>
  //       Interesting how loyalty seems to lose its shine when there’s a small number of valuable Yuu attached to it. Perhaps your friendship was worth a less than our <strong>100Yuu</strong> after all. <br>
  //       To prevent fight between both of you we can't give you his username to you 🙂`,
  //       sendingDate: new Date(),
  //       seen: true
  //     }
  //     refferUser.messages.push(msg);
  //     await refferUser.save();
  //   }
  // }

  delete req.session.userData;

  return res.status(200).json({ success: true, message: "Password set successfully!" });
})
app.post("/verify-captcha", async (req, res) => {
  const { email, cap_token } = req.body;

  if (!cap_token) return res.status(400).json({ success: false, message: "Please verify captcha!" });
  let user = await userModel.findOne({ email: email })
  if (!user) return res.status(400).json({ success: false, message: "User not found!" });

  req.session.captchaVerification = cap_token;
  res.status(200).json({ success: true, message: "All good" });
})
app.get("/send/verification-email", optionalVerifyToken, async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (!req.session.captchaVerification) return res.redirect("/user/login");
  delete req.session.captchaVerification;

  let email = req.query.email;
  let location = req.query.location;
  let purpose = req.query.purpose;

  if (!email) return res.redirect("/user/login");
  const user = await userModel.findOne({ email });
  if (!user) return res.redirect("/user/login");

  if (!(user.verificationOTP.expiresAt > Date.now()) || !user.verificationOTP || user.verificationOTP.purpose != purpose) {
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
    let verificationCode = generateVerificationCode();
    let now = Date.now();
    let expiresAt = new Date(now + 5 * 60 * 1000);

    await userModel.updateOne({ email }, {
      $set: {
        verificationOTP: {
          email,
          otp: verificationCode,
          expiresAt,
          location,
          purpose
        }
      }
    });

    function getEmailTemplate(type, user, code) {
      const year = new Date().getFullYear();
      let html;

      if (type === "email-verification") {
        html = `
  <div style="margin:0; padding:0; background:#F8F9FA; font-family:Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F8F9FA;">
      <tr>
        <td align="center" style="padding:20px 10px;">
          
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" 
                 style="max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

            <!-- HEADER -->
            <tr>
              <td style="background:#023047; padding:24px; text-align:center;">
                <h1 style="color:#CCD6F6; margin:0; font-size:22px;">Verify Your Email</h1>
              </td>
            </tr>

            <!-- CONTENT -->
            <tr>
              <td style="padding:30px 25px;">
                <p style="font-size:16px; color:#333; margin:0 0 12px;">
                  Hi <strong style="color:#023047;">${user.fullname}</strong>,
                </p>

                <p style="font-size:15px; color:#333; line-height:1.6;">
                  To verify your email in <strong>YuuCart</strong>, please use the verification code below:
                </p>

                <!-- OTP -->
                <div style="text-align:center; margin:32px 0;">
                  <span style="font-size:32px; font-weight:bold; color:#FB8500; letter-spacing:8px;">
                    ${code}
                  </span>
                </div>

                <p style="font-size:14px; color:#555; line-height:1.6;">
                  This code is valid for the next <strong>5 minutes</strong>.
                  Please do not share this code with anyone.
                </p>

                <hr style="border-top:1px solid #eee; margin:30px 0;">

                <p style="text-align:center; font-size:13px; color:#999;">
                  &copy; ${year} YuuCart — All Rights Reserved.
                </p>

              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>`;
      } else if (type === "forgot") {
        html = `
  <div style="margin:0; padding:0; background:#F8F9FA; font-family:Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F8F9FA;">
      <tr>
        <td align="center" style="padding:20px 10px;">
          
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" 
                 style="max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

            <!-- HEADER -->
            <tr>
              <td style="background:#023047; padding:24px; text-align:center;">
                <h1 style="color:#CCD6F6; margin:0; font-size:22px;">Reset Your Password</h1>
              </td>
            </tr>

            <!-- CONTENT -->
            <tr>
              <td style="padding:30px 25px;">

                <p style="font-size:16px; color:#333; margin:0 0 12px;">
                  Hi <strong style="color:#023047;">${user.fullname}</strong>,
                </p>

                <p style="font-size:15px; color:#333; line-height:1.6;">
                  We received a request to reset your <strong>YuuCart</strong> password.  
                  Use the security code below to continue:
                </p>

                <!-- OTP -->
                <div style="text-align:center; margin:32px 0;">
                  <span style="font-size:32px; font-weight:bold; color:#D9534F; letter-spacing:8px;">
                    ${code}
                  </span>
                </div>

                <p style="font-size:14px; color:#555; line-height:1.6;">
                  This code is valid for the next <strong>5 minutes</strong>.<br>
                  If you did not request a password reset, simply ignore this email.
                </p>

                <hr style="border-top:1px solid #eee; margin:30px 0;">

                <p style="text-align:center; font-size:13px; color:#999;">
                  &copy; ${year} YuuCart — All Rights Reserved.
                </p>

              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>`;
      }

      return html;
    }

    await sendEmail(email, getEmailTemplate(purpose, user, verificationCode));
    res.render("verify", { email, expiresAt });
  }
  else {
    const expiresAt = new Date(user.verificationOTP.expiresAt);
    res.render("verify", { email, expiresAt });
  }

});
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
    if (user.verificationOTP.purpose == "forgot") {
      req.flash("success", "enter-pass");
      if (user.verificationOTP.location == "user") {
        res.status(200).json({ success: true, redirectTo: "/user/account", message: "OTP verified!" });
      }
      else {
        res.status(200).json({ success: true, redirectTo: "/user/login", message: "OTP verified!" });
      }
    }
    else {
      await userModel.updateOne(
        { email: email },
        { $set: { emailVerified: true } }
      );
      if (user.Reffer.Status !== null && user.Reffer.from !== "") {
        const refferUser = await userModel.findOne({ username: user.Reffer.from });
        if (user.Reffer.Status) {
          // console.log(`True FriendShip`);
          let msg = {
            textContent: `Well, well… someone actually joined through the link! <br>
                Unlike the ones who sold out for our <strong>100Yuu</strong> coins, your friend <strong style="color:#FB8500;">${user.username}</strong> just proved that friendship still exists in this economy.<br>
                Loyalty level: Premium 💙`,
            sendingDate: new Date(),
            seen: true
          }
          refferUser.YuuCoin += 100;
          refferUser.Yuutx.push({ desc: "Referral Bonus", Yuu: 100 });
          refferUser.Reffer.yourReffers.push(user.username);
          refferUser.messages.push(msg);
          await refferUser.save();

          let newMsg = {
            textContent: `Well, well… you actually joined through the link! <br>
                Unlike the ones who sold out for our <strong>100Yuu</strong> coins, you just proved that friendship still exists in this economy.<br>
                Loyalty level: Premium 💙`,
            sendingDate: new Date(),
            seen: true
          }
          user.messages.push(newMsg);
          await user.save();
        }
        else if (!user.Reffer.Status) {
          // console.log(`LoL Fake FriendShip`);
          user.YuuCoin += 100;
          user.Yuutx.push({ desc: "Betray Bonus", Yuu: 100 });
          await user.save();

          let msg = {
            textContent: `
                It appears that your friend just reject your referral link — all for <strong>100Yuu</strong> coins. <br>
                Interesting how loyalty seems to lose its shine when there’s a small number of valuable Yuu attached to it. Perhaps your friendship was worth a less than our <strong>100Yuu</strong> after all. <br>
                To prevent fight between both of you we can't give you his username to you 🙂`,
            sendingDate: new Date(),
            seen: true
          }
          refferUser.messages.push(msg);
          await refferUser.save();
        }
      }
      res.status(200).json({ success: true, redirectTo: "/user/account", message: "OTP verified!" })
    }
    await userModel.updateOne(
      { email: email },
      { $unset: { verificationOTP: "" } }
    );
  }
})
app.post("/set-new-forgot", optionalVerifyToken, async (req, res) => {
  const { password, confirmPassword } = req.body;
  if (password.length < 8 || confirmPassword.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters long!" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match!" });
  }
  const email = req.session.email;
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
app.use("/addons", addonsRouter);
app.use("/api", apiRouter);

// Page Not Found
app.use((req, res) => {
  res.status(404).render("errors/404");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT} ✅`));
