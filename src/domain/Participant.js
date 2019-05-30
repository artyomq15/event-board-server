'use strict';

const mongoose = require( 'mongoose' );

const SCHEMA_NAME = require('./constants/schema-name');

const schema = new mongoose.Schema({
    participant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: SCHEMA_NAME.USER,
    },
    confirmation: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model(SCHEMA_NAME.PARTICIPANT, schema);