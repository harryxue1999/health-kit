'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Connect to MongoDB
const dbURL = require('./settings.json').dbURL;
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('MongoDB connected!'));

exports.User = mongoose.model('User', new mongoose.Schema({
    timestamp: Number,
    name: String,
    phone: Number,
    email: String,
    wechat: { type: String, unique: true },
    identity: { type: String, default: '本科生' },
    area: { type: Number, default: 0, max: 8 },
    address: String,
    addr1: String,
    addr2: String,
    kids: { type: Boolean, default: false },
    symptoms: Array,
    equipment: Array,
    info: { type: String },
    priority: { type: Boolean, default: false },
    need: { type: Boolean, default: false },
    linkViewed: { type: Boolean, default: false },
    delivered: { type: Boolean, default: false },
}));
