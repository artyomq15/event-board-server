'use strict';

const mongoose = require('mongoose');

const SCHEMA_NAME = require('./constants/schema-name');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isPrivate: {
        type: Boolean,
        required: true,
        default: false
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: SCHEMA_NAME.USER
    },
    moderators: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USER,
        }
    ],
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USER,
        }
    ],
    invited: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USER,
        }
    ]
});

module.exports = mongoose.model(SCHEMA_NAME.BOARD, schema);