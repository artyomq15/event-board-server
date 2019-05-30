'use strict';

const jwt = require('express-jwt');
const auth = jwt({
    secret: 'MY_SECRET',
    userProperty: 'payload'
});
const router = require('express').Router();

const authController = require('../controllers/auth.controller');

router.post('/register', authController.signUp);
router.post('/login', authController.signIn);

router.use('/user', auth, require('./user.router'));
router.use('/events', auth, require('./event.router'));
router.use('/boards', auth, require('./board.router'));

module.exports = router;
