const nodemailer = require("nodemailer");


async function mailer(options){
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER, // generated ethereal user
          pass: process.env.SMTP_PASSWD, // generated ethereal password
        },
      });
    
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: 'shashank@shashankdutt.in', // sender address
        to: options.toMail, // list of receivers
        subject: "You Forgot your password", // Subject line
        text: options.message, // plain text body
      });
}

module.exports = mailer