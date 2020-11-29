const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
var bcrypt = require('bcrypt');
var saltRounds = 10;
var User = require('./models/user');
const app = express();
var passport = require('passport');
var jsonwt = require('jsonwebtoken');

require('dotenv').config()
const myKey = require("./mysetup/myurl");
// MIDDLEWARES
app.use(cors());
// BODY PARSER

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Passport middleware
app.use(passport.initialize());
//Config for JWT strate
require("./strategies/jsonwtStrategy")(passport);



// IMPORT ROUTES
const defaultRoute = require('./routes/default');
app.use('/api', defaultRoute)


// The register route
app.post("/signup", async (req, res) => {
    var newUser = new User({
      name: req.body.name,
      password: req.body.password
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
  // The login route
  app.post("/login", async (req, res) => {
    var newUser = {};
    newUser.name = req.body.name;
    newUser.password = req.body.password;
  
    await User.findOne({ name: newUser.name })
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
  // to check login status 
  app.get(
    "/profile",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      console.log(req);
      res.json({
        id: req.user.id,
        name: req.user.name
      });
    }
  );








// CONNECT TO DB
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.fqs8g.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, {
        useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true
    }, () => console.log('Successfully connected to DB')
)
// LISTENING ON PORT :
const port = process.env.PORT || 4200
app.listen(port, () => console.log(`Listening on port ${port} ...`));

