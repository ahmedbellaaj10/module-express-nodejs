const express = require('express');
const router = express.Router();
const passport = require('passport');
const jsonwt = require('jsonwebtoken');
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../models/user');
const Service = require('../models/service');
const myKey = require("../mysetup/myurl");
const {body, validationResult} = require('express-validator');
const utils = require('../utils/utils');
const constant = require('../utils/constant');
const userService = require('../services/user.service');
const user = require('../models/user');
const { uuid } = require('uuidv4');


require('dotenv').config()

/**
 * UPDATE PROFILE
 */
router.put(
    "/profile/update", [
        // age must be a number
        body('age').isNumeric().optional().custom(age => age > 15).withMessage('age must be at least 16'),
        // yearsOfExperience must be a number
        body('yearsOfExperience').isNumeric().optional()
            .custom(experience => experience < 50 && experience >= 0).withMessage('experience must be between 0-50'),
        // picture must be a base64
        body('picture').isBase64().optional(),
        body('name').isString().optional().isLength({max: 15}),
        body('lastname').isString().optional().isLength({max: 15}),
        body('description').isString().optional(),
    ],
    passport.authenticate("jwt", {session: false}),
    (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            User.findOne({'_id': req.user._id}, async function (err, user) {
                if (err) return res.status(404).send({error: 'Profile not found'});
                if (req.body.picture) {
                    const fileName = utils.generatePathFile('.png', constant.PATH.users);
                    fs.writeFile(fileName, req.body.picture, 'base64', function (err) {
                        if (err) {
                            console.log('image saving :', err)
                        }
                    });
                    await user.updateOne({'picture': fileName.split('media')[1]});
                }
                user.updateOne({
                        'age': req.body.age ? req.body.age : user.age,
                        'name': req.body.name ? req.body.name : user.name,
                        'lastname': req.body.lastname ? req.body.lastname : user.lastname,
                        'description': req.body.description ? req.body.description : user.description,
                        'yearsOfExperience': req.body.yearsOfExperience ? req.body.yearsOfExperience : user.yearsOfExperience

                    },
                    {rawResult: true}, async function (err, resp) {
                        if (err) {
                            res.status(400).send({error: 'update  failed'});
                        } else {
                            const user = await userService.getUserById(req.user.id);
                            return res.status(200).send(user);
                        }
                    }
                );
            });
        } catch (error) {
            return res.status(404).send({error: 'Profile not found'});
        }
    }
);

/**
 * GET PROFILE
 */
router.get(
    "/profile",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const user = await userService.getUserById(req.user.id);
            return res.status(200).send(user);
        } catch (error) {
            return res.status(404).send({error: 'Profile not found'});
        }


    }
);

/**
 * ACTIVATION ACCOUNT
 */
router.get("/account-activation/:id/:code",
    async (req, res) => {

    await User.findOne({'_id': req.params.id})
        .then(async profile => {
            if (profile) {
                if (profile.isActivated) {
                    return res.redirect(process.env.FRONTEND_URL + '/login');
                }
                else if (profile.verificationCode == req.params.code) {
                         profile.verificationCode = null;
                         profile.isActivated = true;
                         await profile
                             .save()
                             .then(() => {
                                 return res.redirect(process.env.FRONTEND_URL + '/login');
                             })
                             .catch(err => {
                                 console.log("Error is ", err.message);
                                 return res.redirect(process.env.FRONTEND_URL + '/');

                             });

                     }
                else {
                    return res.redirect(process.env.FRONTEND_URL + '/');

                }

            } else {
                return res.redirect(process.env.FRONTEND_URL + '/');
            }
        })
        .catch(err => {
            return res.redirect(process.env.FRONTEND_URL + '/');
        });
});
/**
 * LOGIN
 */
router.post("/login",
    async (req, res) => {
        var newUser = {};
        newUser.email = req.body.email;
        newUser.password = req.body.password;

        await User.findOne({email: newUser.email})
            .then(profile => {
                if (!profile) {
                    res.status(404).send({error: "User not exist"});
                } else {
                    if (!profile.isActivated) {
                        res.status(400).send({error: "Account not activated"});
                    }
                    bcrypt.compare(
                        newUser.password,
                        profile.password,
                        async (err, result) => {
                            if (err) {
                                console.log("Error is", err.message);
                            } else if (result === true) {
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
                                        return res.json({
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


/**
 * REGISTER
 */
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
        lastname: req.body.lastname,
        verificationCode: uuid()
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
                                utils.verificationEmail(newUser.email, newUser.verificationCode, newUser._id);
                                return res.status(200).send({response: `User Created Successfully, Welcome ${newUser.name}`});
                            })
                            .catch(err => {
                                return res.status(400).send({error: 'Cannot create User with such data !'});
                            });
                    }
                });
            } else {
                return res.status(404).send({error: "User already exists..."});
            }
        })
        .catch(err => {
            console.log("Error is", err.message);
        });
});
/**
 * UPDATE A SERVICE
 */
router.put("/service/update/:id",
    passport.authenticate("jwt", {session: false}),
    (req, res) => {
        Service.findOne({'_id': req.params.id}).then((sv) => {
            if (sv) {
                if (sv.ownerID != req.user._id) {
                    return res.status(401).send({
                        message: "Unauthorized !",
                    });
                }
                if (req.body.image) {
                    delete req.body.image;
                }
                Service.findByIdAndUpdate(req.params.id, req.body, {new: true})
                    .then((service) => {
                        if (!service) {
                            return service.status(404).send({
                                message: "Not Found",
                            });
                        }
                        res.status(200).send(service);
                    })
                    .catch((err) => {
                        return res.status(404).send({
                            message: "error while updating the post",
                        });
                    });
            }
            else {
                return res.status(404).send({
                    message: "Not found !",
                });
            }
        }).catch((err) => {
            return res.status(400).send({
                message: "error before updating !",
            });
        });

    });
/**
 * DELETE A SERVICE
 */
router.delete("/service/delete/:id",
    passport.authenticate("jwt", {session: false}),
    (req, res) => {
        Service.findOne({'_id': req.params.id}).then((sv) => {
            if (sv) {
                if (sv.ownerID != req.user._id) {
                    return res.status(401).send({
                        message: "Unauthorized !",
                    });
                }
                Service.findByIdAndRemove(req.params.id)
                    .then((service) => {
                        if (!service) {
                            return res.status(404).send({
                                message: "Not Found",
                            });
                        }
                        res.status(200).send({message: "service deleted successfully!"});
                    })
                    .catch((err) => {
                        return res.status(500).send({
                            message: "Could not delete service ",
                        });
                    });
            }
            else {
                 return  res.status(404).send({
                    message: "Not found !",
                });
            }
        }).catch((err) => {
            return res.status(400).send({
                message: "error before deleting !",
            });
        });
    });
   
/**
 * LIST SERVICES
 */
router.get("/service/list",
    (req, res) => {
        Service.find()
            .sort({name: -1})
            .then((services) => {
                return res.status(200).send(services);
            })
            .catch((err) => {
                return res.status(500).send({
                    message: err.message || "Error Occurred",
                });
            })
    });
/**
 * GET A SERVICE BY ID
 */
router.get("/service/:id",
    (req, res) => {
        Service.findOne({'_id': req.params.id}).then((sv) => {
            if (sv) {
                return res.status(200).send(sv);
            }
            else {
                 return res.status(404).send({
                    message: "Not found !",
                });
            }
        }).catch((err) => {
            return res.status(400).send({
                message: "error before fetching !",
            });
        });
    });
    
/**
 * CREATE A SERVICE
 */
router.post("/service/create",
    passport.authenticate("jwt", {session: false}),
    (req, res) => {
        const service = new Service({
            ownerID: req.user._id,
            description: req.body.description,
            title: req.body.title,
            post: req.body.post,
            image: [],
        });
        /**
         * Save service to database
         */

        if (req.body.image) {
            for (let i = 0; i < req.body.image.length; i++) {
                const fileName = utils.generatePathFile('.png', constant.PATH.services);
                fs.writeFile(fileName, req.body.image[i], 'base64', function (err) {
                    if (err) {
                        console.log('image ' + i + ' saving :', err)
                    }
                });
                service.image.push(fileName.split('media')[1]);
            }
        }

        service
            .save()
            .then((data) => {
                res.send(data);
            })
            .catch((err) => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the Service.",
                });
            });
    })

  /**
 * Search a Profile by it's name
 */
router.get("/profile/list/name/:t",
(req, res) => {
    if(!req.params.t)
    {
        return res.status(404).send({message: "You didn't provide any search criteria"});
    }
    var regexQuery = {
        name: new RegExp(req.params.t, 'i')
      }
    User.find(regexQuery)
        .sort({name: -1})
        .then((services) => {
            return res.status(200).send(services);
        })
        .catch((err) => {
            return res.status(500).send({
                message: err.message || "Error Occurred",
            });
        })
});
    /**
 * Search a Service by it's post
 */
router.get("/service/list/post/:t",
(req, res) => {
    if(!req.params.t)
    {
        return res.status(404).send({message: "You didn't provide any search criteria"});
    }
    var regexQuery = {
        post: new RegExp(req.params.t, 'i')
      }
    Service.find(regexQuery)
        .sort({name: -1})
        .then((services) => {
            return res.status(200).send(services);
        })
        .catch((err) => {
            return res.status(500).send({
                message: err.message || "Error Occurred",
            });
        })
});
/**
 * Search a Service by it's title
 */
router.get("/service/list/title/:t",
    (req, res) => {
        if(!req.params.t)
        {
            return res.status(404).send({message: "You didn't provide any search criteria"});
        }
        var regexQuery = {
            title: new RegExp(req.params.t, 'i')
          }
        Service.find(regexQuery)
            .sort({name: -1})
            .then((services) => {
                return res.status(200).send(services);
            })
            .catch((err) => {
                return res.status(500).send({
                    message: err.message || "Error Occurred",
                });
            })
    });







module.exports = router;
