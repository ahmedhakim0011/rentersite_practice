const Joi = require('joi');
const { ROLES } = require('../../utils/constants');


exports.registerUserValidation = Joi.object({
    fullName: Joi.string().required().messages({
        'any.required': 'FullName is required',
        'string.empty': 'FullName cannot be empty'
    }),
    email: Joi.string().required().messages({
        'any.required': 'email is required',
        'string.empty': 'email cannot be empty',
        'string.email': 'Please enter a valid email'
    }),
    password: Joi.string().min(5).max(30).required().messages({
        'any.required': 'Password is required.',
        'string.empty': 'Password cannot be empty.',
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must be at least 8 characters'
    }),
    dob: Joi.date(),
    role: Joi.string().valid(ROLES.TENANT, ROLES.ADMIN, ROLES.OWNER).default(ROLES.TENANT),
    deviceToken: Joi.string().optional()
}).messages({
    'object.unknown': 'Invalid field (#label)'
});
exports.loginUserValidation = Joi.object({
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required.',
        'string.empty': 'Email cannot be empty.',
        'string.email': 'Email must be a valid email address.'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required.',
        'string.empty': 'Password cannot be empty.'
    }),
    device_token: Joi.string().required().messages({
        'any.required': 'Device token is required.'
    })
});


exports.updateProfileValidation = Joi.object({
    full_name: Joi.string().allow('', null).messages({
        'string.empty': 'Full name cannot be empty.'
    }),
    phone_number: Joi.string().required().messages({
        'any.required': 'Phone number is required.',
        'string.max': 'Phone number must be between 8 to 15 digits',
        'string.min': 'Phone number must be between 8 to 15 digits'
    }),
    facebook: Joi.string().allow('', null),
    instagram: Joi.string().required().allow('', null).messages({
        'any.required': 'Instagram is required.'
    }),
    location: Joi.string().required().allow('', null).messages({
        'any.required': 'Location is required.'
    }),
    longitude: Joi.string().required().allow('', null).messages({
        'any.required': 'Longitude is required.'
    }),
    latitude: Joi.string().required().allow('', null).messages({
        'any.required': 'Latitude is required.'
    }),
    bio: Joi.string().required().allow('', null).messages({
        'any.required': 'Bio is required.'
    }),
    profile_image: Joi.string().allow('', null),
    ssn_image: Joi.string().allow('', null)
});