'use strict';

const passport = require('passport');

const User = require('../domain/User');

module.exports.signUp = (req, res) => {
    const user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.setPassword(req.body.password);

    User.findOne(
        {
            email: req.body.email
        }, 
        (err, foundUser) => {

            if (err) {
                return res.satus(err.status).json(err);
            }

            if (foundUser) {
                return res.status(403).json({
                    message: 'There is account with such email.'
                });
            }

            user.save(function(err) {

                if (err) {
                    return res.satus(err.status).json(err);
                }

                const token = user.generateJwt();
                
                return res.status(200).json({ token });
            });
        })
};

module.exports.signIn = (req, res, next) => {

    passport.authenticate(
        'local',
        (err, user) => {

            if (err) {
                return res.status(err.status).json(err);
            }

            if (user) {
                const token = user.generateJwt();
                return res.status(200).json({ token });
            }

            return res.status(403).json({
                message: 'Wrong username or password.'
            });

        })(req, res, next);
};