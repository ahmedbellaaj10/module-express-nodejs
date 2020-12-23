const Service = require('../models/service');
const mongoose = require('mongoose');


async function getServicesFilter(search, userId) {
    const filter = {
        $or: [{ title: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') },
            { post: new RegExp(search, 'i') },
        ],
    }
    if (userId.match(/^[0-9a-fA-F]{24}$/)) {
        filter.ownerID  = userId
    }
    return await Service.find(filter).populate('ownerID',
        ['-password'
        ,'-verificationCode',
        '-phoneCode'])
        .sort({updatedAt: -1})



}

module.exports = {
    getServicesFilter,
}
