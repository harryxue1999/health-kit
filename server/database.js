'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Connect to MongoDB
const dbURL = require('./settings.json').dbURL;
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('MongoDB connected!'));

exports.User = mongoose.model('Sep2020', new mongoose.Schema({
    timestamp: Number,
    name: String,
    phone: Number,
    email: { type: String, unique: true },
    wechat: String,
    location: Number,
    time: String,
    timeOk: { type: Boolean, default: false },
    timeBad: { type: Boolean, default: false },
    proposedTime: { type: String },
    timeRevised: { type: Boolean, default: false },
    kids: { type: Boolean, default: false },
    travel: { type: Boolean, default: false },
    symptoms: Array,
    equipment: Array,
    info: { type: String },
    receivedKit: { type: Boolean, default: false },
    priority: { type: Boolean, default: false },
    linkViewed: { type: Boolean, default: false },
    delivered: { type: Boolean, default: false },
}));
