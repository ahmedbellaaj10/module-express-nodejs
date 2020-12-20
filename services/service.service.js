const Service = require('../models/service');
const mongoose = require('mongoose');


async function getServicesFilter(search, userId) {
    const filter = {
        $or: [{ title: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') },
            { post: new RegExp(search, 'i') },
        ],
        ownerID: new RegExp(userId, 'i')

    }
    return await Service.find(filter)
        .sort({updatedAt: -1})



}

module.exports = {
    getServicesFilter,
}
