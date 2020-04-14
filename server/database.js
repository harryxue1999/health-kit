'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Connect to MongoDB
const dbURL = require('./settings.json').dbURL;
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('MongoDB connected!'));

exports.User = mongoose.model('User', new mongoose.Schema({
    name: { type: String },
    phone: { type: Number },
    email: { type: String },
    wechat: { type: String, unique: true },
    identity: { type: String, default: '本科生' },
    area: { type: Number, default: 0 },
    address: { type: String },
    addr1: { type: String },
    addr2: { type: String },
    kids: { type: Boolean, default: false },
    symptoms: { type: Array },
    equipment: { type: Array },
    info: { type: String },
}));
