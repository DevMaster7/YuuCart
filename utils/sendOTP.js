// const nodemailer = require("nodemailer");
// const env = require("dotenv");
// const resend = require("resend")

// env.config();
// async function sendEmail(mail, html) {
//   const resend = new Resend(process.env.RESEND_API_KEY);

//   await resend.emails.send({
//     from: `YuuCart ${process.env.EMAIL}`,
//     to: `${mail}`,
//     subject: "Your YuuCart OTP Code",
//     html: `${html}`
//   });
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const mailOptions = {
//   from: `"YuuCart " <${process.env.EMAIL}>`,
//   to: `${mail}`,
//   subject: "Your YuuCart OTP Code",
//   html: `${html}`,
// };

// try {
//   const info = await transporter.sendMail(mailOptions);
// } catch (error) {
//   console.error("Error sending email:", error);
// }
// }

// module.exports = sendEmail;

const { Resend } = require("resend");
const env = require("dotenv");

env.config();

async function sendEmail(mail, html) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "YuuCart <onboarding@resend.dev>",
    to: mail,
    subject: "Your YuuCart OTP Code",
    html: html
  });
}

module.exports = sendEmail;
