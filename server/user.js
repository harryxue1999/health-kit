'use strict';

const crypto = require('crypto');
const router = require('express').Router();
const moment = require('moment');
const { User } = require('./database');
const { KEY, IV, homeURL } = require('./settings.json');

const REGEXP = /^((\d+)(\s(N|S|E|W|NORTH|SOUTH|EAST|WEST)\.?)?(\s\d+(ST|ND|RD|TH)?)?(\s[A-Za-z]+\.?)*(\s(HOUSES|HEIGHTS|HTS|AVENUE|AVE|ROAD|RD|WAY|ROW|BRAE|STREET|ST|COURT|CT|HARBOR|DRIVE|DR|LANE|LN|CIRCLE|CIR|BOULEVARD|BLVD|PARKWAY|PKWY|PASS|MALL|TERRACE|RUN|TRAIL|TRL|PLACE|PL)\.?))(([\w\.\,\s\-\#])*)/i;

// Check if wechat is unique
router.post('/unique', async (req, res) => {
    const wechat = req.body.wechat.toLowerCase();
    const user = await User.findOne({ wechat });
    if (user) return res.json({ error: 'WECHAT_NAME_EXISTS' });

    return res.json({ available: true });
});

// Updates user information
router.post('/:hash/update', async (req, res) => {
    const wechat = decode(req.params.hash);
    const form = req.body;
    const userObj = getUpdatedUser(form);

    const user = await User.findOneAndUpdate({ wechat }, userObj);
    if (!user) return res.json({ error: 'USER_NOT_FOUND' });

    return res.json({ user: {...userObj}, hash: encode(userObj.wechat) });
});

// Finds the current user
router.post('/:hash', async (req, res) => {
    try {
        const wechat = decode(req.params.hash);
        const user = await User.findOne({ wechat });
        if (!user) return res.json({ error: 'USER_NOT_FOUND' });

        return res.json({ user, hash: req.params.hash });
    } catch (e) {
        res.status(400).end({ error: 'BAD_REQUEST' });
    }
});

function normalizeAddress(addr) {
    const address = addr.trim().toUpperCase()
            .replace(/[^\w\-\s]/g, ' ')
            .split(/\s+/).join(' ')
            .replace(/WEST/, 'W')
            .replace(/NORTH/, 'N')
            .replace(/EAST/, 'E')
            .replace(/SOUTH/, 'S')
            .replace(/HEIGHTS/g, 'HTS')
            .replace(/AVENUE/g, 'AVE')
            .replace(/ROAD/g, 'RD')
            .replace(/STREET/g, 'ST')
            .replace(/COURT/g, 'CT')
            .replace(/DRIVE/g, 'DR')
            .replace(/LANE/g, 'LN')
            .replace(/CIRCLE/g, 'CIR')
            .replace(/BOULEVARD/g, 'BLVD')
            .replace(/PARKWAY/g, 'PKWY')
            .replace(/TRAIL/g, 'TRL')
            .replace(/PLACE/g, 'PL')
            .replace(/(\d+)([A-Z]+)/g, '$1 $2')
            .replace(/([A-Z]+)(\d+)/g, '$1 $2');

    const matched = address.match(REGEXP);
    if (matched === null) return [ '', '' ];
    return [
        matched[1].trim().replace(/EAGLE HTS$/g, 'EAGLE HEIGHTS DR'),
        matched[10].trim().replace(/(APT|APARTMENT|ROOM|RM|SUITE|UNIT)([A-Z])/g, '$1 $2')
    ];
}

function getUpdatedUser(user) {
    const timestamp = moment.utc().unix();
    const name = user.name.trim();
    const phone = +user.phone;
    const email = user.email.trim().toLowerCase();
    const wechat = user.wechat.trim().toLowerCase();
    const normalizedAddr = normalizeAddress(user.address);
    const { kids, symptoms, equipment } = user;
    const priority = kids || symptoms.length > 0 || equipment.length === 0;

    return {
        timestamp,
        name,
        phone,
        email,
        wechat,
        identity: user.identity,
        area: +user.area,
        address: user.address.trim(),
        addr1: normalizedAddr[0],
        addr2: normalizedAddr[1],
        kids: Boolean(kids),
        symptoms,
        equipment,
        info: user.info || '',
        priority,
        need: user.need
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
