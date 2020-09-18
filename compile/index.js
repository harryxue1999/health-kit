'use strict';

const Promise = require('bluebird');
const fetch = require('node-fetch');
const moment = require('moment');
const fs = Promise.promisifyAll(require('fs'));
const csv = require('csv-parser');
const { googleAPIKey } = require('../server/settings.json');
const { User } = require('../server/database');

const FILENAME = process.argv[2];

const REGEXP = /^((\d+)(\s(N|S|E|W|NORTH|SOUTH|EAST|WEST)\.?)?(\s\d+(ST|ND|RD|TH)?)?(\s[A-Za-z]+\.?)*\s(HOUSES|HEIGHTS|HTS|AVENUE|AVE|ROAD|RD|WAY|ROW|BRAE|STREET|ST|COURT|CT|HARBOR|DRIVE|DR|LANE|LN|CIRCLE|CIR|BOULEVARD|BLVD|PARKWAY|PKWY|PASS|MALL|TERRACE|RUN|TRAIL|TRL|PLACE|PL)\.?)(([\w\.\,\s\-\#])*)/i;

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
        matched[9].trim().replace(/(APT|APARTMENT|ROOM|RM|SUITE|UNIT)([A-Z])/g, '$1 $2')
    ];
}

let i = 0;
fs.createReadStream(FILENAME)
    .pipe(csv())
    .on('data', async (user) => {
        const timestamp = moment.utc(user.timestamp).unix();
        const name = user.name.trim();
        const phone = +user.phone;
        const email = user.email.trim().toLowerCase();
        const wechat = user.wechat.trim().toLowerCase();
        const time = user.time.trim().toLowerCase();
        const kids = user.kids === '是';
        const travel = user.travel === '是';
        const receivedKit = user.receivedKit === '是';
        const info = user.info;

        const HUMANITIES = /^human/i;
        const SHEBOYGAN = /^she/i;
        const location = HUMANITIES.test(user.location) ? 0
            : SHEBOYGAN.test(user.location) ? 1 : 2;

        const symptoms = [], equipment = [];
        if (user.symptoms.indexOf('无') < 0) {
            for (const s of user.symptoms.split(', ')) symptoms.push(s);
        }

        if (user.equipment.indexOf('都没有') < 0) {
            for (const e of user.equipment.split(', ')) equipment.push(e);
        }

        const priority = kids || symptoms.length > 0 || equipment.length === 0 || travel;

        const userObj = {
            timestamp,
            name,
            phone,
            email,
            wechat,
            time,
            location,
            kids,
            travel,
            symptoms,
            equipment,
            receivedKit,
            info,
            priority
        };

        const existUser = await User.findOne({ wechat });

        // User already exists. If data is newer, then update
        if (existUser) {
            if (existUser.timestamp < timestamp) {
                const data = await User.findOneAndUpdate({ wechat }, userObj);
                if (data) console.log(`已更新 - ${data.name}: ${data.email}`);
            }
        }

        else {
            const newUser = new User(userObj);
            try {
                const data = await newUser.save();
                if (data) {
                    console.log(`${++i} 已登记 - ${data.name}: ${data.email}`);
                }
            } catch(e) {}
        }
    }).on('end', () => {
        console.log(`DONE`);
        // process.exit(0);
    });