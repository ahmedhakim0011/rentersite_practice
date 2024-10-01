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