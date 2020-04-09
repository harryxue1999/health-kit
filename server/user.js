'use strict';

const crypto = require('crypto');
const router = require('express').Router();
const mailgun = require('./mailgun');
const { User } = require('./database');
const { SECRET, homeURL } = require('./settings.json');

// Check if a user has already logged in;
router.post('/status', (req, res) => {
    const ssn = req.session;
    if (!ssn.loggedIn) res.json({ loggedIn: false });
    else {
        // const { loggedIn, email, name } = ssn;
        const { loggedIn, email, name } = { loggedIn: true, email: 'hxue36@wisc.edu', name: '薛皓宇' };
        res.json({ loggedIn, email, name });
    }
});

// Registers a new user
router.post('/register', async (req, res) => {
    const ssn = req.session;
    const { email } = req.body;

    // try {
        // Checks if user already exists
        const userExists = await User.findOne( { email });
        if (userExists) {
            ssn.email = email;
            return res.status(409).json({ error: 'USER_EXISTS', email });
        }

        // User doesn't exist, create new
        else {
            const newUser = new User({ email });
            const data = await newUser.save();
            ssn.email = data.email;

            // Sends verification email
            const encoded = encode(email);
            const mailObj = {
                to: email,
                subject: '请确认您的电子邮箱 Please verify your email',
                text: '您好！请点击下面的链接确认邮箱地址。这个链接将是您登陆的唯一方式，请妥善保存！\n'
                    + homeURL + `user/${encoded}`
            };
            mailgun.send(mailObj);

            return res.json({ url: encoded });
        }

    // } catch (err) {
    //     return res.status(400).json({ error: err });
    // }
   
});

// Logs out a user
router.post('/logout', (req, res) => {
    const ssn = req.session;
    if (ssn.destroy) ssn.destroy();
    res.json({ success: typeof ssn.loggedIn === 'undefined' })
});

// Finds the current user
router.get('/:hash', async (req, res) => {
    const email = decode(req.params.hash);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });

    const { name } = user;
    ssn.loggedIn = true;
    ssn.email = email;
    ssn.name = name;
    return res.json({ loggedIn: true, email, name });
});


/**
 * 
 * @param {String} plaintext 
 */
function encode (plaintext) {
    const secret = SECRET;
    const enc = [];
    for (let i = 0; i < plaintext.length; i += 1) {
        const keyC = secret[i % secret.length];
        const encC = `${String.fromCharCode((plaintext[i].charCodeAt(0) + keyC.charCodeAt(0)) % 256)}`;
        enc.push(encC);
    }
    const str = enc.join('');
    return encodeURIComponent(Buffer.from(str, 'binary').toString('base64'));
}
  
/**
 * 
 * @param {String} ciphertext 
 */
function decode (ciphertext) {
    const secret = SECRET;
    const dec = [];
    const enc = Buffer.from(decodeURIComponent(ciphertext), 'base64').toString('binary');
    for (let i = 0; i < enc.length; i += 1) {
        const keyC = secret[i % secret.length];
        const decC = `${String.fromCharCode((256 + enc[i].charCodeAt(0) - keyC.charCodeAt(0)) % 256)}`;
        dec.push(decC);
    }
    return dec.join('');
}

module.exports = router;
