'use strict';

const mustache = require('mustache');
const { User } = require('../server/database');
const fs = require('fs');
const path = require('path');
const template = fs.readFileSync(path.resolve('template.html'), 'utf-8');
const mailgun = require('../server/mailgun');

function findAddressWithNoRoomNum () {
    // Query criteria:
    // Person is near Madison, has wisc.edu account, but did not put in a room or apartment number
    // This excludes anyone in Eagle Heights who put an apartment letter (APT X)
    // Query logic:
    /*
    (Person lives close to Madison)
        AND
    (Person has a wisc.edu address)
        AND
    (addr2 does not have the Eagle Heights apartment designator i.e. APT X)
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
            { info: { $not: { $regex: '@' } } },
            { addr2: { $not: { $regex: '((APT|APARTMENT|ROOM) [A-Z])|(^[A-Z]$)|(^[A-Z] .+$)' } } },
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
        console.log(`${name} <${email}> \b\b\b\b\t\t\t 登记地址: ${address} \b\b\b\b\t\t\t decode1: "${addr1}", decode2: "${addr2}"`)
    }
}

function sendMail (i) {
    const emailContent = mustache.render(template, {
        name: 'XZY',
        address: '888 Some St City State',
        addr1: '888 SOME ST',
        addr2: 'CITY ST'
    });

    return mailgun.send({
        subject: '健康包登记表 - 地址信息更新',
        html: emailContent
    });
}

module.exports = { findAddressWithNoRoomNum, print, sendMail };
