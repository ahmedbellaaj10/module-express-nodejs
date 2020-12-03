const express = require('express');
const router = express.Router();
const passport = require('passport');
const jsonwt = require('jsonwebtoken');
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../models/user');
const myKey = require("../mysetup/myurl");
const {body, validationResult} = require('express-validator');
const utils = require('../utils/utils');
const userService = require('../services/user.service');


require('dotenv').config()

// UPDATE USER PROFILE
router.put(
    "/profile/update", [
        // age must be a number
        body('age').isNumeric().custom(age => age > 15).withMessage('age must be at least 16'),
        // yearsOfExperience must be a number
        body('yearsOfExperience').isNumeric()
            .custom(experience => experience < 50 && experience >= 0).withMessage('experience must be between 0-50'),
        // picture must be a base64
        body('picture').isBase64(),
    ],
    passport.authenticate("jwt", {session: false}),
    (req, res) => {
        try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        User.findOne({'_id': req.user._id}, function (err, user) {
            if (err) return res.status(404).send({error: 'Profile not found'});
            const fileName = utils.generatePathFile( '.png');
            fs.writeFile( fileName , req.body.picture, 'base64', function (err) {
                if (err) {console.log('image saving :', err)}
            });
            user.updateOne({'picture': fileName.split('media')[1],'age': req.body.age,'yearsOfExperience': req.body.yearsOfExperience},
                {rawResult: true}, async function (err, resp) {
                    if (err) {
                        res.status(400).send({error: 'update  failed' });
                    } else {
                        const user = await  userService.getUserById(req.user.id);
                        return res.status(200).send(user);
                    }
                }
            );
        });
    }
        catch (error) {
            return res.status(404).send({error: 'Profile not found'});
        }}

);

// GET USER PROFILE
router.get(
    "/profile",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const user = await userService.getUserById(req.user.id);
            return res.status(200).send(user);
        }
        catch (error) {
            return res.status(404).send({error: 'Profile not found'});
        }



    }
);

// The login route
router.post("/login", async (req, res) => {
    var newUser = {};
    newUser.email = req.body.email;
    newUser.password = req.body.password;

    await User.findOne({email: newUser.email})
        .then(profile => {
            if (!profile) {
                res.status(404).send({error: "User not exist"});
            } else {
                bcrypt.compare(
                    newUser.password,
                    profile.password,
                    async (err, result) => {
                        if (err) {
                            console.log("Error is", err.message);
                        } else if (result === true) {
                            //   res.send("User authenticated");
                            const payload = {
                                id: profile.id,
                                name: profile.name,
                                email: profile.email,
                                isAdmin: profile.isAdmin,
                            };
                            jsonwt.sign(
                                payload,
                                myKey.secret,
                                {expiresIn: 3600},
                                (err, token) => {
                                   return  res.json({
                                        user: payload,
                                        success: true,
                                        token: "Bearer " + token
                                    });
                                }
                            );
                        } else {
                            return res.status(401).send({error: "User Unauthorized Access"});
                        }
                    }
                );
            }
        })
        .catch(err => {
            console.log("Error is ", err.message);
        });
});

// The register route
router.post("/signup", [
    // username must be an email
    body('email').isEmail(),
    // password must be at least 5 chars long
    body('password',
        "Password should be combination of one uppercase ," +
        " one lower case, " +
        " one digit and min 8 , " +
        "max 20 char long")
        .matches("^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,20}$", "i")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    const newUser = new User({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
        lastname: req.body.lastname
    });
    await User.findOne({email: newUser.email})
        .then(async profile => {
            if (!profile) {
                bcrypt.hash(newUser.password, saltRounds, async (err, hash) => {
                    if (err) {
                        console.log("Error is", err.message);
                    } else {
                        newUser.password = hash;
                        await newUser
                            .save()
                            .then(() => {
                                res.status(200).send({response: `User Created Successfully, Welcome ${newUser.name}`});
                            })
                            .catch(err => {
                                console.log("Error is ", err.message);
                            });
                    }
                });
            } else {
                res.status(404).send({error: "User already exists..."});
            }
        })
        .catch(err => {
            console.log("Error is", err.message);
        });
});


module.exports = router;
