const nodemailer = require("nodemailer");
// Nodemailer
const sendEmail = async (options) => {
  // 1- create transporter service
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // if secure false port=587 else if true port=465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2- email options
  const mailOpts = {
    from: "E-shop App <markmagdy822000@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOpts);
};
module.exports = sendEmail;
