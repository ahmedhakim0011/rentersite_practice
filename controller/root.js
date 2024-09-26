'use strict';

const { generateResponse } = require('../utils');

exports.defaultHandler = (req, res) => {
    console.log(`debug res ${res}`)
    generateResponse({}, 'welcome to the Rentersite Practice API', res);
}