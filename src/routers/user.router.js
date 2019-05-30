'use strict';

const router = require('express').Router();
const userController = require('../controllers/user.controller');

router
    .route('/profile')
    .get(userController.getUser);

router
    .route('/search')
    .get(userController.searchUser);

module.exports = router;
