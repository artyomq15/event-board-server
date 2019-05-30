'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routers/router');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');


let url;
if (process.env.NODE_ENV === 'test') {
    url = 'mongodb://localhost:27017/timeTableTest';
} else {
    url = 'mongodb://localhost:27017/timeTable';
}



app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,DELETE,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();

});

mongoose.Promise = global.Promise;

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

require('./config/passport')(passport); //add this line

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', router);



mongoose.connect(url, { useNewUrlParser: true }).then(
    () => {
        app.listen(3000, function() {
            console.log('Listening on port 3000...');
        });
    },
    (err) => {
        console.log('Unable to connect to Mongo.');
        process.exit(1);
    }
);

module.exports = app;
