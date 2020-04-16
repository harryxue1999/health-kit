'use strict';

const mustache = require('mustache');
const { User } = require('../server/database');
const fs = require('fs');
const path = require('path');
const mailgun = require('../server/mailgun');

const templates = {
    confirmAddr: fs.readFileSync(path.resolve('templates/confirm_address.html'), 'utf-8')
}

function findAddressWithNoRoomNum () {
    // Query criteria:
    // Person is near Madison, has wisc.edu account, but did not put in a room or apartment number
    // This excludes anyone in Eagle Heights and Sheboygan
    // Excludes those who put an apartment letter (APT X)
    // Query logic:
    /*
    (Person lives close to Madison)
        AND
    (Person does not live in Sheboygan)
        AND
    (Person does not live in Eagle Heights)
        AND
    (Person has a wisc.edu address)
        AND
    (addr2 does not have letter apartment designator i.e. APT X)
        AND (
            (addr2 field is empty)
                OR
            (addr2 field has no number)
                OR
            (addr2 field starts with no numbers, then ends with ZIPCODE)
        )
    */
    const queryObj = {
        $and: [
            { area: { $ne: 8 } },
            // { area: { $ne: 3 } },
            // { area: { $ne: 2 } },
            { info: { $not: { $regex: '@' } } },
            { addr2: { $not: { $regex: '((APT|APARTMENT|ROOM|RM|SUITE) [A-Z])|(^[A-Z]$)|(^[A-Z] .+$)' } } },
            { $or: [
                { addr2: '' },
                { addr2: { $not: { $regex: '\\d+' } } },
                { addr2: { $regex: '^[A-Z\\s]+\\d{5}(\\-\\d{4})?$' } } 
            ] }
        ]
    };

    return User.find(queryObj);
}

async function print () {
    const users = await findAddressWithNoRoomNum();
    for (let r of users) {
        const { name, email, address, addr1, addr2 } = r;
        console.log(`${name} <${email}> \t\t 登记地址: ${address} \t\t decode1: "${addr1}", decode2: "${addr2}"`)
    }
    console.log(users.length);
}

function findHarry () {
    return User.findOne({ wechat: 'harry1999' });
}

async function sendMail (i) {
    const users = await findAddressWithNoRoomNum();

    for (let user of users) {
        const user = users[i];
        const emailContent = mustache.render(templates.confirmAddr, {
            name: user.name,
            address: user.address,
            addr1: user.addr1,
            addr2: user.addr2 || '----'
        });
    
        const response = await mailgun.send({
            subject: '健康包信息登记：请确认房间号',
            to: user.email,
            html: emailContent
        });

        console.log(++i, user.email, response.message);
    }
}

async function sendConfirmationToAll(i) {
    // To be implemented
}

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

module.exports = { findAddressWithNoRoomNum, print, sendMail };
