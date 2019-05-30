'use strict';

const router = require('express').Router();
const boardController = require('../controllers/board.controller');

router
    .route('/')
    .get(boardController.getBoards)
    .post(boardController.add)
    .put(boardController.update);

router
    .route('/search')
    .get(boardController.searchBoards);

router
    .route('/invites')
    .get(boardController.getBoardInvites);

router
    .route('/:id')  
    .get(boardController.get)
    .delete(boardController.delete);

router
    .route('/:id/events')  
    .get(boardController.getEvents);

router
    .route('/accepting')
    .put(boardController.accept);

router
    .route('/entering')
    .put(boardController.enter)

router
    .route('/declining')
    .put(boardController.decline);

router
    .route('/leaving/:id')
    .put(boardController.leave);

module.exports = router;
