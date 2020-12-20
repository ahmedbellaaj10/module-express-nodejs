const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,

    },
    lastname: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    picture: {
        type: String,
        require: false,
    },
    age: {
        type: Number,
        require: false
    },
    yearsOfExperience: {
        type: Number,
        require: false
    },
    isAdmin: {
        type: Boolean,
        require: false,
        default: false
    },
    description: {
        type: String,
        require: false
    },
    isActivated: {
        type: Boolean,
        require: false,
        default: false
    },
    verificationCode: {
        type: String,
        require: false,
    },
    phone:{
        type: String,
        require: false,
    },
    phoneValid: {
        type: Boolean,
        require: false,
        default: false
    },
    phoneCode:{
        type: Number,
        require: false,
    },
    isArtisan:{
        type: Boolean,
        require: false,
        default: false
    }
}, {timestamps: true});

module.exports = User = mongoose.model('User', UserSchema);
