const mongoose = require('mongoose');
const ServiceSchema = mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true
    },
    post: {
        type: String,
        require: true
    },
    image: [{
        type: String,
        require: true,
    }],
    ownerID: {
        type: String,
        require: true,
    },
}, {timestamps: true});

module.exports = Service = mongoose.model('Service', ServiceSchema);
