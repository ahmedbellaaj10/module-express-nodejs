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
    }
}, { timestamps: true });

module.exports = User = mongoose.model('User', UserSchema);
