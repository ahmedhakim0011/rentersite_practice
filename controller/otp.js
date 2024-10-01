const { deleteOTP, getOTP, addOTP } = require("../models/otp");
const { STATUS_CODE } = require("../utils/constants");
const { parseBody, generateRandomOTP, generateResponse } = require("../utils/index");
const { findUser } = require("../models/user");
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