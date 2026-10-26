const nodemailer = require("nodemailer");

 

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: process.env.ADMIN_MAIL_USER,

        pass: process.env.ADMIN_MAIL_PASS

    }

});

 

module.exports = transporter;