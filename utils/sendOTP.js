const nodemailer = require("nodemailer");
const env = require("dotenv");

env.config();
async function sendEmail(mail, html) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"YuuCart " <${process.env.EMAIL}>`,
    to: `${mail}`,
    subject: "Your YuuCart OTP Code",
    html: `${html}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = sendEmail;
