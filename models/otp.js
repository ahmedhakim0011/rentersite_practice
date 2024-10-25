'use strict';
const { Schema, model } = require('mongoose');

const OTPSchema = new Schema({

    email: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const OTPModel = model('OTP', OTPSchema);


// opt expiration 
OTPSchema.methods.isExpired = function () {
    return Date.now() - this.createdAt > Number(process.env.OTP_EXPIRATION);
  }


// create new OTP 

exports.addOTP = (obj) => OTPModel.create(obj);

// find OTP by query 
exports.getOTP = (query) => OTPModel.findOne(query);
// delete OTP 

exports.deleteOTP = (email) => OTPModel.deleteMany({ email })
