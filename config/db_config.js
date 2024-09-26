'use strict';

const mongoose = require('mongoose');

class DB_Connet {
    constructor() {
        mongoose.set('strictQuery', true);
        mongoose.connect(process.env.MONGODB_URL).then(() => console.log('Connected to DB')).catch((e) => console.log('db error', e));
    }
}

module.exports = DB_Connet;