const User = require('../models/user');


async function getUserById(id) {
    const user = await User.findOne({'_id': id});
    return {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        isAdmin: user.isAdmin,
        age: user.age,
        picture: user.picture,
        yearsOfExperience: user.yearsOfExperience,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
}

module.exports = {
    getUserById
}
