const User = require('../models/user');


async function getUserById(id) {
    const user = await User.findOne({'_id': id});
    return {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        phoneValid: user.phoneValid,
        isAdmin: user.isAdmin,
        isArtisan: user.isArtisan,
        age: user.age,
        picture: user.picture,
        yearsOfExperience: user.yearsOfExperience,
        description: user.description,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
}

async function getArtisansFilter(search='') {
    const filter = {
        $or: [{ name: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') },
            { lastname: new RegExp(search, 'i') },
            { email: new RegExp(search, 'i') },
            ],

        isActivated: true,
        isArtisan: true,
    }
    const users = await User.find(filter)
        .sort({updatedAt: -1});
    return users.map((user) => {
        return {
            id: user.id,
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone,
            phoneValid: user.phoneValid,
            isAdmin: user.isAdmin,
            isArtisan: user.isArtisan,
            age: user.age,
            picture: user.picture,
            yearsOfExperience: user.yearsOfExperience,
            description: user.description,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }

    });

}

module.exports = {
    getUserById,
    getArtisansFilter
}
