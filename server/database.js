'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Connect to MongoDB
const dbURL = require('./settings.json').dbURL;
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('MongoDB connected!'));

exports.User = mongoose.model('Sep2020', new mongoose.Schema({
    name: String,
    phone: Number,
    email: { type: String, unique: true },
    wechat: String,
    location: Number,
    time: String,
    kids: { type: Boolean, default: false },
    symptoms: Array,
    equipment: Array,
    info: { type: String },
    priority: { type: Boolean, default: false },
    receivedKit: { type: Boolean, default: false },
    linkViewed: { type: Boolean, default: false },
    delivered: { type: Boolean, default: false },
}));
