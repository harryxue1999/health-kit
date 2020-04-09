'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Connect to MongoDB
const dbURL = require('./settings.json').dbURL;
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('MongoDB connected!'));

exports.User = mongoose.model('User', new mongoose.Schema({
    name: { type: String, default: undefined },
    email: { type: String, required: true },
    type: { type: String, default: undefined },
    address: { type: String, default: undefined },
    coords: { type: Array, default: [] }
}));
