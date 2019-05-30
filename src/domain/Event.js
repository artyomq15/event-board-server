'use strict';

const mongoose = require('mongoose');

const SCHEMA_NAME = require('./constants/schema-name');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    timeFrom: {
        type: Date,
        required: true
    },
    timeTo: {
        type: Date,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: SCHEMA_NAME.USER
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USER
        }
    ],
    invited: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USER
        }
    ],
    userCollisions: [
        {
            name:{
                type: String,
                required: true
            },
            collision: {
                type: Boolean,
                required: true
            }
        }
    ],
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: SCHEMA_NAME.BOARD
    }
});

module.exports = mongoose.model(SCHEMA_NAME.EVENT, schema);