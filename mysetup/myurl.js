require('dotenv').config()
module.exports = {
    secret:`${process.env.JWT_SECRET}` //going to be used later on for key token
 }
