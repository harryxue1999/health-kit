'use strict';

const Promise = require('bluebird');
const router = require('express').Router();
const request = require('request-promise');
const url = require('url');
const querystring = require('querystring');
const settings = require('./settings.json');
const adminlist = require('./adminlist.json');
const parse = addr => querystring.parse(url.parse(addr).query);
const fs = require('fs');
const path = require('path');

const { User } = require('./database');
const mustache = require('mustache');
const mailgun = require('./mailgun');
const template = fs.readFileSync(path.join(__dirname, '../compile/templates/delivered.html'), 'utf-8');

const TOKEN_LINK = 'https://accounts.google.com/o/oauth2/v2/auth?' + querystring.stringify({
    client_id: settings.client.id,
    redirect_uri: settings.redirectURI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/userinfo.email'
});

// Checks admin loggedIn status
router.post('/status', (req, res) => {
    const ssn = req.session;
    
    // Debug purposes
    // ssn.loggedIn = true;
    // ssn.hasPerm = true;
    // ssn.adminName = 'Awesome Tester';
    // ssn.adminEmail = 'tester@awesome.com';
    // ssn.adminPerm = '.*';

    if (!ssn.loggedIn) return res.json({ loggedIn: false });

    return res.json({
        loggedIn: true,
        hasPerm: ssn.hasPerm,
        email: ssn.adminEmail,
        name: ssn.adminName
    });
});

router.post('/deliver', async (req, res) => {
    const ssn = req.session;
    if (!ssn.loggedIn || !ssn.hasPerm) return res.json({ error: 'NO_PERMISSION' });

    const { wechat } = req.body;
    const user = await User.findOne({ wechat, delivered: false });

    if (!user) return res.json({ error: 'ALREADY_DELIVERED' });

    const newUser = await user.updateOne({ delivered: true });

    if (!newUser) return res.json({ error: 'UNKNOWN_USER' });

    const { io } = res.locals;
    io.emit('delivery', { wechat });

    const { name, area } = user;
    const isOnCampus = area === 0 || area === 1 || area === 4;
    const isSheboygan = area === 2;
    const isEagleHeights = area === 3;
    // Send email
    let emailContent = mustache.render(template, {
        name,
        isOnCampus,
        isSheboygan,
        isEagleHeights,
    });

    const response = await mailgun.send({
        subject: isOnCampus ? '健康包：已送达' : '健康包：已自取',
        to: user.email,
        html: emailContent
    });

    return res.json({ success: 'SUCCESS', response });
});

// Gets all undelivered users in database
router.get('/all', async (req, res) =>{
    const ssn = req.session;
    if (!ssn.hasPerm) return res.json({ error: 'Unauthorized '});

    const users = await User.find({ delivered: false, addr1: { $regex: ssn.adminPerm } });
    return res.json(users);
});

// admin login endpoint
router.get('/login', (req, res) => {
    req.session.started = true;
    req.session.ip = req.headers['cf-connecting-ip']
        || req.headers['x-real-ip']
        || req.connection.remoteAddress;
    res.redirect(TOKEN_LINK);
});

// admin callback endpoint
router.get('/callback', (req, res) => {
    const ssn = req.session;

    if (!ssn.started) {
        res.redirect('/');
        return;
    }

    const urlArgs = parse(req.url);

    // On receiving authorization code
    if (urlArgs.code) {
        ssn.authCode = urlArgs.code;
    } else if (urlArgs.error) {
        log('Login error: %s (%s)', urlArgs.error, ssn.ip);
        ssn.destroy();
        res.redirect('/?error=' + urlArgs.error);
    }

    // Exchanges for information
    if (ssn.authCode && !ssn.accessToken) {

        // Gets access token
        getAccessToken(req).then(getUserEmail).then(() => {
            res.redirect('/');
        }).catch(err => {
            console.log(err);
            log(err.error);
            res.redirect('/?error=' + err.error);
        });
    }
});

// Admin logout endpoint
router.get('/logout', (req, res) => {
    const ssn = req.session;
    if (!ssn.loggedIn) res.redirect('/');
    else {
        log('Logged out from admin portal: %s <%s> (%s)', ssn.adminName, ssn.adminEmail, ssn.ip);
        if (ssn.destroy) ssn.destroy();
        res.redirect('/');
    }
});

// ==== Helper Methods ====

function log (...args) {
    const date = '[ ' + new Date().toUTCString() + ' ] ';
    console.log(date + (args.shift() || ''), ...args);
}

/**
 * Gets user access token
 *
 * @param {Object} req The request object
 * @returns {Promise}
 */
function getAccessToken (req) {
    const ssn = req.session;
    return request.post({
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        url: 'https://oauth2.googleapis.com/token',
        form: {
            client_id: settings.client.id,
            client_secret: settings.client.secret,
            grant_type: 'authorization_code',
            code: ssn.authCode,
            redirect_uri: settings.redirectURI,
        }
    }).then(data => {
        data = JSON.parse(data);
        ssn.accessToken = data.access_token;
        return Promise.resolve(req);
    }).catch(err => Promise.reject(err));
}

/**
 * Gets user email address
 *
 * @param {Object} req The request object
 * @returns {Promise}
 */
function getUserEmail (req) {
    const ssn = req.session;
    return request.get({
        headers: { 'Authorization': 'Bearer ' + ssn.accessToken },
        url: 'https://openidconnect.googleapis.com/v1/userinfo'
    }).then(data => {
        data = JSON.parse(data);
        const adminEmail = data.email;
        const adminArr = adminlist[adminEmail];
        let adminName, adminPerm;
        if (adminArr) {
            adminName = adminArr[0];
            adminPerm = adminArr[1];
        }

        ssn.loggedIn = true;
        ssn.adminEmail = adminEmail;
        ssn.hasPerm = data.hd === 'wisc.edu' && typeof adminName !== 'undefined';
        ssn.adminName = ssn.hasPerm ? adminName : 'unauthorized';
        ssn.adminPerm = adminPerm;
        log('Logged in to admin portal: %s <%s> (%s)', ssn.adminName, ssn.adminEmail, ssn.ip);
        return Promise.resolve();
    }).catch(err => Promise.reject(err));
}

module.exports = router;
