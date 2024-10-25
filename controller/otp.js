const { deleteOTP, getOTP, addOTP } = require("../models/otp");
const { STATUS_CODE } = require("../utils/constants");
const { parseBody, generateRandomOTP, generateResponse } = require("../utils/index");
const { findUser, updateUserById, generateToken } = require("../models/user");
const { sendEmail } = require("../utils/mailer");


exports.generateOTP = async (req, res, next) => {
    const { email } = parseBody(req.body);
    if (!email)
        return next({
            data: { status: false },
            statusCode: STATUS_CODE.BAD_REQUEST,
            message: "Email is required"

        });

    try {
        const user = await findUser({ email });
        if (!user)
            return next({
                data: { status: false },
                statusCode: STATUS_CODE.NOT_FOUND,
                message: "user not found"
            })

        await deleteOTP(email);

        const otpObj = await addOTP({
            email,
            otp: generateRandomOTP()
        });


        await sendEmail(email, "OTP", `Your OTP is ${otpObj.otp}`);
        generateResponse(
            otpObj,
            "OTP Successfully send ",
            res
        )

    } catch (e) {
        next(new Error(e.message));
    }
}
exports.verifyOTP = async (req, res, next) => {
    const { otp } = parseBody(req.body);
    console.log(otp);

    if (!otp) return next({
        status: false,
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "OTP is required"
    });

    try {
        const otpObj = await getOTP({ otp });
        if (!otpObj) return next({
            status: false,
            statusCode: STATUS_CODE.BAD_REQUEST,
            message: "Invalid OTP"
        });
        // if (otpObj.isExpired()) return next({
        //     status: false,
        //     statusCode: STATUS_CODE.BAD_REQUEST,
        //     message: "OTP expired"
        // });
        const user = await findUser({ email: otpObj.email });
        if (!user) return next({
            status: fasle,
            statusCode: STATUS_CODE.BAD_REQUEST,
            message: "user not found"

        });

        const User = await updateUserById(user._id, { isVerified: true });
        const token = generateToken(user);

        generateResponse({ token, User }, 'email has been verified successfully', res);

    } catch (e) {
        next(new Error(e.message));
    }

}