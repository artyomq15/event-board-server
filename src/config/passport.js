'use strict';

const User = require('../domain/User');
const Strategy = require('passport-local').Strategy;

module.exports = function(passport) {
    passport.use(
        'local',
        new Strategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function(email, password, done) {
            User.findOne({ email }, function (err, user) {

                if (err) { 
                    return done(err); 
                }

                if (!user) {
                    return done(null, false, {
                        message: 'User not found'
                    });
                }
                if (!user.validatePassword(password)) {
                    return done(null, false, {
                        message: 'Password is wrong'
                    });
                }

                return done(null, user);
            });
        }
    ));
}
