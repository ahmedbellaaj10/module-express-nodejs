const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/user'); // necessary to connect to DB  don't remove it !!!
const app = express();
const passport = require('passport');
require('dotenv').config()
bodyParser.json({limit: "50mb"})
app.use(express.json({limit: '50mb'}));
// MIDDLEWARES
app.use(cors());
// BODY PARSER
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// SERVING FILES
app.use(express.static('media'));

//Passport middleware
app.use(passport.initialize());
require("./strategies/jsonwtStrategy")(passport);


// IMPORT ROUTES
const defaultRoute = require('./routes/default');
app.use('/api', defaultRoute)


// CONNECT TO DB
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}${process.env.DB_CLUSTER}${process.env.DB_NAME}?retryWrites=true&w=majority`, {
        useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true
    }, () => console.log('Successfully connected to DB')
)
// LISTENING ON PORT :
const port = process.env.PORT || 4200
app.listen(port, () => console.log(`Listening on port ${port} ...`));
