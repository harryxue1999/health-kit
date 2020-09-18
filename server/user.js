'use strict';

const crypto = require('crypto');
const router = require('express').Router();
const moment = require('moment');
const { User } = require('./database');
const { KEY, IV } = require('./settings.json');

// Check if email is unique
router.post('/unique', async (req, res) => {
    const email = req.body.email.toLowerCase();
    const user = await User.findOne({ email });
    if (user) return res.json({ error: 'EMAIL_EXISTS' });

    return res.json({ available: true });
});

// Updates user information
router.post('/:hash/update', async (req, res) => {
    const email = decode(req.params.hash);
    const form = req.body;
    const userObj = getUpdatedUser(form);

    const user = await User.findOneAndUpdate({ email }, userObj);
    if (!user) return res.json({ error: 'USER_NOT_FOUND' });

    if (form.onUserConfirm) {
        const { io } = res.locals;
        const { timeOk, timeBad, proposedTime } = userObj;
        io.emit('userConfirm', { email, timeOk, timeBad, proposedTime })
    }

    return res.json({ user: {...userObj}, hash: encode(userObj.email) });
});

// Finds the current user
router.post('/:hash', async (req, res) => {
    try {
        const email = decode(req.params.hash);
        const user = await User.findOne({ email });
        if (!user) return res.json({ error: 'USER_NOT_FOUND' });

        // Update link viewed status
        if (!user.linkViewed) {
            const stagingUser = await User.findOneAndUpdate({ email }, { linkViewed: true });
            if (!stagingUser) return res.json({ error: 'LINK_VIEW_UPDATE_FAILED '});
        }

        user.linkViewed = true;
        return res.json({ user, hash: req.params.hash });
    } catch (e) {
        res.status(400).json({ error: 'BAD_REQUEST' });
    }
});


function getUpdatedUser(user) {
    const timestamp = moment.utc().unix();
    const name = user.name.trim();
    const phone = +user.phone;
    const email = user.email.trim().toLowerCase();
    const wechat = user.wechat.trim().toLowerCase();
    const { kids, symptoms, equipment, travel, time } = user;
    const { timeOk, timeBad, proposedTime } = user;
    const priority = kids || symptoms.length > 0 || equipment.length === 0;

    return {
        name,
        phone,
        email,
        wechat,
        location: user.location,
        kids: Boolean(kids),
        travel,
        symptoms,
        equipment,
        info: user.info || '',
        priority,
        time, 
        timeOk,
        timeBad,
        proposedTime,
        receivedKit: user.receivedKit
    };
}

function encode(text) {
    let iv = Buffer.from(IV, 'hex');
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(KEY), iv);
    let encrypted = cipher.update(text);
   
    encrypted = Buffer.concat([encrypted, cipher.final()]);
   
    return encrypted.toString('hex');
}
   
function decode(text) {
    try {
        let iv = Buffer.from(IV, 'hex');
        let encryptedText = Buffer.from(text, 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(KEY), iv);
        let decrypted = decipher.update(encryptedText);
    
        decrypted = Buffer.concat([decrypted, decipher.final()]);
   
        return decrypted.toString();
    } catch (e) {
        return '';
    }
}

module.exports = router;
