const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendEmail(mail, html) {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com", // Gmail nahi, Brevo ka host
    port: 587,                    // ya 465 agar secure chahiye
    secure: false,               // true if port 465, false if 587
    auth: {
      user: process.env.BREVO_LOGIN,    // yeh hoga 985198001@smtp-brevo.com
      pass: process.env.BREVO_SMTP_KEY,  // Brevo API key
    },
  });

  const mailOptions = {
    from: `"QuickCart 👋" <${process.env.BREVO_SENDER}>`, // yeh wahi email honi chahiye jo Brevo par verified hai
    to: mail,
    subject: "Your QuickCart OTP Code",
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

module.exports = sendEmail;
