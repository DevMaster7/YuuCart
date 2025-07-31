const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendEmail(mail, html) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"QuickCart 👋" <youremail@gmail.com>',
    to: `${mail}`,
    subject: "Your QuickCart OTP Code",
    html: `${html}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = sendEmail;
