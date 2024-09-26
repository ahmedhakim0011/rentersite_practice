const Joi = require('joi');
const { ROLES } = require('../../utils/constants');


exports.registerUserValidation = Joi.object({
    name: Joi.string().required.messages({
        'any.required': 'Name is required',
        'string.empty': 'Name cannot be empty'
    }),
    email: Joi.string().required.messages({
        'any.required': 'email is required',
        'string.empty': 'email cannot be empty',
        'string.email': 'Please enter a valid email'
    }),
    password: Joi.string().required().message({
        'any.required': 'Password is required.',
        'string.empty': 'Password cannot be empty.',
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must be at least 8 characters'
    }),
    dob: Joi.date(),
    role: Joi.string().valid(ROLES.TENANT, ROLES.ADMIN, ROLES.OWNER).default(ROLES.TENANT),
    deviceToken: Joi.string().optional()
}).message({
    'object.unknown': 'Invalid field (#label)'
})