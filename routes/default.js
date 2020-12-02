const express = require('express');
const router = express.Router();
var passport = require('passport');
var jsonwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
var bcrypt = require('bcrypt');
var saltRounds = 10;
var User = require('../models/user');

require('dotenv').config()
const myKey = require("../mysetup/myurl");
const { body, validationResult } = require('express-validator');



  // to check login status 
  router.get(
    "/profile",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      console.log(req);
      res.json({
        id: req.user.id,
        name: req.user.name,
        lastname:req.user.lastname,
        email:req.user.email,
        age:req.user.age
      });
    }
  );

  // The login route
  router.post("/login", async (req, res) => {  
    var newUser = {};
    newUser.email = req.body.email;
    newUser.password = req.body.password;
  
    await User.findOne({ email: newUser.email })
      .then(profile => {
        if (!profile) {
          res.send("User not exist");
        } else {
          bcrypt.compare(
            newUser.password,
            profile.password,
            async (err, result) => {
              if (err) {
                console.log("Error is", err.message);
              } else if (result == true) {
                //   res.send("User authenticated");
                const payload = {
                  id: profile.id,
                  name: profile.name
                };
                jsonwt.sign(
                  payload,
                  myKey.secret,
                  { expiresIn: 3600 },
                  (err, token) => {
                    res.json({
                      success: true,
                      token: "Bearer " + token
                    });
                  }
                );
              } else {
                res.send("User Unauthorized Access");
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
router.post("/signup",[
  // username must be an email
  body('email').isEmail(),
  // password must be at least 5 chars long
  body('password',"Password should be combination of one uppercase , one lower case,  one digit and min 8 , max 20 char long").matches("^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,20}$", "i")
], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
    var newUser = new User({
      name: req.body.name,
      password: req.body.password,
      email:req.body.email,
      age:req.body.age,
      lastname:req.body.lastname
    });
    await User.findOne({ name: newUser.name })
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
                  res.status(200).send(newUser);
                })
                .catch(err => {
                  console.log("Error is ", err.message);
                });
            }
          });
        } else {
          res.send("User already exists...");
        }
      })
      .catch(err => {
        console.log("Error is", err.message);
      });
  });   















module.exports = router;