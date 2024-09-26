const { createUser, findUser } = require('../models/user');
const { STATUS_CODE } = require('../utils/constants')
const { generateRandomOTP, parseBody, generateResponse } = require('../utils/index');
const { registerUserValidation } = require('../validation/userValidation');
const { addOTP, deleteOTP } = require('../models/otp');
const { sendEmail } = require("../utils/mailer");
const { hash } = require("bcrypt");

exports.register = async (req, res, next) => {
    const body = parseBody(req.body);
    const { error } = registerUserValidation.validate(body);

    if (error) {
        return next({
            status: false,
            statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
            message: error.details[0].message,
        });
    }
    try {
        // checking if given email is already registered in platform 
        const userExist = await findUser({ email: body.email });
        if (userExist) {
            return next({
                data: {
                    status: false,
                  },
                  statusCode: STATUS_CODE.BAD_REQUEST,
                message: "User already exist, try using different email"
            })
        }
        // hashing password
        const hashedPassword = await hash(body.password, 10);
        body.password = hashedPassword;
        if (req.file) body.image = `users/${req.file.filename}`;
        //  Add image path to the user object 
        const user = createUser(body);
        // deleting OTPs for this email 
        await deleteOTP(body.email);

        const otpObject = await addOTP({
            email: body.email,
            otp: generateRandomOTP(),
        });

        if (!user) {
            return next({
                status: true,
                statusCode: STATUS_CODE.INTERNAL_SERVER_ERROR,
                message: "Something went wrong",
            })
        }
        // send email
        await sendEmail(body.email, "OTP", `your OTP is ${otp.otp}`);

        generateResponse(
            { user, otp: otpObject.otp, },
            "OTP has been sent to your registered email",
            res)


    } catch (e) {
        next(new Error(error.message));
    }
}