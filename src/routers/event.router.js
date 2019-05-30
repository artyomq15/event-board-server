'use strict';

const router = require('express').Router();
const eventController = require('../controllers/event.controller');

router
    .route('/')
    .get(eventController.loadEvents)
    .post(eventController.addEvent);

router
    .route('/:id')  
    .delete(eventController.deleteEvent)
    .put(eventController.updateEvent)

router
    .route('/invites')
    .get(eventController.loadEventInvites)

router
    .route('/deleteParticipant/:id')
    .put(eventController.deleteParticipant);

router
    .route('/accepting')
    .post(eventController.acceptEvent);

router
    .route('/declining')
    .post(eventController.declineEvent);

router
    .route('/collisions/')
    .get(eventController.findCollisions);

module.exports = router;
