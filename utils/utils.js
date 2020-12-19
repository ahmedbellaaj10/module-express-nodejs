const constant = require('./constant');
const { uuid } = require('uuidv4');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const handlebars = require('handlebars');
const fs = require('fs');
require('dotenv').config()

// EMAIL CONFIGURATION
const CONFIGURATION = nodemailer.createTransport(smtpTransport({
    host: process.env.EMAIL_HOST,
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
}));



function generatePathFile(extension, folder) {
    const timestamp = new Date().getTime().toString();
    return constant.MEDIA_FOLDER + folder + timestamp + uuid() + extension ;
}

function verificationEmail(to, activationCode, id) {
    readHTMLFile(__dirname + '/templates/email_verification.html', function(err, html) {
        const template = handlebars.compile(html);
        const context = {
            email: to,
            url: process.env.BACKEND_URL + `/api/account-activation/${id}/${activationCode}`
        };
        const htmlToSend = template(context);
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to : to,
            subject : 'Account Activation',
            html : htmlToSend,
            attachments: [{
                filename: 'logo.png',
                path: __dirname + '/templates/assets/logo.png',
                cid: 'logo'
            }]
        };

        CONFIGURATION.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
            }
        });
    });

}











const readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            throw err;
        }
        else {
            callback(null, html);
        }
    });
};

module.exports = {generatePathFile,verificationEmail};




