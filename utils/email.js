const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { logger } = require("./logger");

module.exports.send = async (data) => {
  try {
    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
      host: "localhost",
      port: 1025,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    await transporter.sendMail({
      from: '"Fred Foo 👻" <app@mailhog.local>', // sender address
      to: data.email, // list of receivers
      subject: data.subject, // Subject line
      text: data.content, // plain text body
      html: data.content, // html body
    });
    return true;
  } catch (err) {
    logger.error(err);
    return false;
  }
};

module.exports.verifyEmail = (user, message) => {
  const verificationToken = jwt.sign(
    {
      sub: {
        email: user.email,
        role: user.role,
        verified: user.verified,
      },
    },
    process.env.EMAIL_VERIFY_SECRET,
    { expiresIn: 60 * 5 }
  );

  this.send({
    content: `Click on the link to verify your ${process.env.APP_NAME}'s account 
  <a href= http://localhost:3000/v1/users/verify-email/${verificationToken}>link</a>`,
    email: user.email,
    subject: `Verification of ${process.env.APP_NAME}`,
  }).catch((err) => logger.error(err));

  return {
    message: message,
    expiry: 60 * 5,
  };
};

module.exports.resetEmail = (user, message) => {
  const verificationToken = jwt.sign(
    {
      sub: {
        email: user.email,
        role: user.role,
        verified: user.verified,
      },
    },
    user.password,
    { expiresIn: 60 * 5 }
  );

  this.send({
    content: `Click on the link to reset your ${process.env.APP_NAME}'s password 
  <a href= http://localhost:3000/v1/users/reset-password/${verificationToken}>link</a>`,
    email: user.email,
    subject: `Verification of ${process.env.APP_NAME}`,
  }).catch((err) => logger.error(err));

  return {
    message: message,
    expiry: 60 * 5,
  };
};
