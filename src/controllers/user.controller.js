'use strict';

const User = require('../domain/User',);

module.exports.getUser = (req, res) => {
    if (!req.payload._id) {
        return res.status(401).json({
            message : "UnauthorizedError: private profile"
        });
    }
        
    User.findById(req.payload._id)
        .exec((err, user) => {

            if (err) {
                return res.status(err.status).json(err);
            }

            return res.status(200).json(user);
        });
};

module.exports.searchUser = (req, res) => {
    User.find({
            $or: [
                { name: { $regex : req.query.query, $options: 'i' } },
                { email: { $regex : req.query.query, $options: 'i' } }
            ]
        })
        .exec((err, user) => {

            if (err) {
                return res.status(err).status(err);
            }

            return res.status(200).json(user);
        })


    }