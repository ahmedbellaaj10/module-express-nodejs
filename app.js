const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
var User = require('./models/user');
const app = express();
var passport = require('passport');
require('dotenv').config()

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


// CONNECT TO DB
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.fqs8g.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, {
        useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true
    }, () => console.log('Successfully connected to DB')
)
// LISTENING ON PORT :
const port = process.env.PORT || 4200
app.listen(port, () => console.log(`Listening on port ${port} ...`));

