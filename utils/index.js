'use strict';
const { STATUS_CODE } = require('./constants');

exports.generateResponse = (data, message, res) => {
    return res.status(STATUS_CODE.OK).send({
        status: true,
        data,
        message
    });
}


exports.generateRandomOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
}


exports.parseBody = (body) => {
    let object;
    console.log(object)
    if (typeof body === "object") object = body;
    else object = JSON.parse(body);
    return object;

}

