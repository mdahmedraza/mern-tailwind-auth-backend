import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

import ENV from '../config.js';

// https://ethereal.email/create
let nodeConfig = {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: ENV.EMAIL,
        pass: ENV.PASSWORD,
    }
}

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "Mailgen",
        link: 'https://mailgen.js/'
    }
})

/*
POST: http://localhost:8000/api/registerMail
"username": "example123",
"userEmail": "ahamedraza2233@gmail.com",
"text": "testing mail",
"subject": "backend mail request"
} */
export const registerMail = async (req, res) => {
    const {username, userEmail, text, subject} = req.body;

    // bofy of the email
    var email = {
        body: {
            name: username,
            intro: text || 'welcome to daily tution! we are very excited to have you on board.',
            outro: 'Need help, or have questions? just reply to this email, we would love to help.'
        }
    }
    var emailBody = MailGenerator.generate(email);

    let message = {
        from: ENV.EMAIL,
        to: userEmail,
        subject: subject || 'signup successful',
        html: emailBody
    }

    // send mail
    transporter.sendMail(message)
        .then(() => {
            return res.status(200).send({msg: "you should receive an email from us."})
        })
        .catch(error => res.status(500).send({error}))
}