'use strict';
const multer = require('multer');
const { STATUS_CODE } = require('./constants');
const fs = require('fs');

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
    if (typeof body === "object") object = body;
    else object = JSON.parse(body);
    return object;

}

const generateFileName = (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.split('.').pop());
}

exports.upload = (folderName) => {
    return multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                const path = `uploads/${folderName}`;
                fs.mkdirSync(path, { recursive: true })
                cb(null, path);



            },
            filename: generateFileName
        }),
        limits: { fileSize: 100 * 1024 * 1024 }, // max 100MB

        fileFilter: function (req, file, cb) {
            if (file.mimetype.startsWith('image/') || file.mimetype('video/') || file.mimetype.startsWith('pdf/')) {
                return cb(null, true);
            }
            console.log("this is point 2")

            req.fileValidationError = 'Only image / video files are allowed!';
            return cb(null, false);

        }
    })
}

