'use strict';

const Promise = require('bluebird');
const fetch = require('node-fetch');
const fs = Promise.promisifyAll(require('fs'));
const csv = require('csv-parser');
const { googleAPIKey } = require('../server/settings.json');
const { User } = require('../server/database');

const FILENAME = process.argv[2];
let count = 0;

const REGEXP = /^((\d+)(\s(N|S|E|W|NORTH|SOUTH|EAST|WEST)\.?)?(\s\d+(ST|ND|RD|TH)?)?(\s[A-Za-z]+\.?)*(\s(HOUSES|HEIGHTS|HTS|AVENUE|AVE|ROAD|RD|WAY|ROW|BRAE|STREET|ST|COURT|CT|HARBOR|DRIVE|DR|LANE|LN|CIRCLE|CIR|BOULEVARD|BLVD|PARKWAY|PKWY|PASS|MALL|TERRACE|RUN|TRAIL|TRL|PLACE|PL)\.?))(([\w\.\,\s\-\#])*)/i;

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
        matched[10].trim().replace(/(APT|APARTMENT)([A-Z])/g, '$1 $2')
    ];
}

fs.createReadStream(FILENAME)
    .pipe(csv())
    .on('data', async (user) => {
        const phone = +user.phone;
        const email = user.email.toLowerCase();
        const wechat = user.wechat.trim().toLowerCase();
        const area = +user.area.substring(0, 1);
        const kids = user.kids === '是';
        const symptoms = [], equipment = [];

        if (user.symptoms.indexOf('无') < 0) {
            for (const s of user.symptoms.split(', ')) symptoms.push(s);
        }

        if (user.equipment.indexOf('都没有') < 0) {
            for (const e of user.equipment.split(', ')) equipment.push(e);
        }

        const normalizedAddr = normalizeAddress(user.address);
        // console.log(normalizedAddr);

        const newUser = new User({
            name: user.name,
            phone,
            email,
            wechat,
            identity: user.identity,
            area,
            address: user.address,
            addr1: normalizedAddr[0],
            addr2: normalizedAddr[1],
            kids,
            symptoms,
            equipment,
            info: user.info
        });

        try {
            const data = await newUser.save();
            if (data) {
                // console.log(`已登记 - ${data.name}: ${data.email}`);
                ++count;
            }
        } catch(e) {}
    }).on('close', () => {
        console.log(`Added ${count} people`);
    });