'use strict'

const { Schema, model } = require('mongoose');
const { ROLES } = require('../utils/constants');
const { sign } = require('jsonwebtoken');


const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
    },
    fullName: { type: String, default: null },

    password: {
        type: String,
        required: true,
        select: false
    },
    phone_number: {
        type: String
    },
    role: {
        type: String,
        enum: Object.values(ROLES)
    },
    ssn_image: {
        type: Schema.Types.ObjectId,
        ref: 'Media',
        default: null
    },
    backgroundImage: {
        type: Schema.Types.ObjectId,
        ref: 'Media',
        default: null
    },
    profileImage: {
        type: Schema.Types.ObjectId,
        ref: 'Media',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    facebool_url: {
        type: String,
        default: null,

    },
    instagram_url: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    coordinates: {
        type: { type: String }, coordinates: [Number]
    },
    bio: {
        type: String,
        default: null,
    },
    is_completed: {
        type: Boolean,
        default: false
    },
    isNotification: {
        type: Boolean,
        default: true,
    },
    deviceToken: {
        type: String,
        default: null
    },
    __v: {
        type: Number,
        select: false,
    },


}, { timestamps: true });

const UserModel = model('users', userSchema);

// create new user
exports.createUser = (obj) => UserModel.create(obj);


// find user by query 
exports.findUser = (query) => UserModel.findOne(query).populate('profileImage ssn_image backgroundImage');


// update user by id 


exports.updateUserById = (userId, obj) => UserModel.findByIdAndUpdate(userId, obj, { new: true })


exports.generateToken = (user) => {
    const token = sign({
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
    }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION }

    )
    return token;
}