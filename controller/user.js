const { createUser, findUser, updateUserById, generateToken } = require('../models/user');
const { STATUS_CODE } = require('../utils/constants')
const { generateRandomOTP, parseBody, generateResponse } = require('../utils/index');
const { registerUserValidation, loginUserValidation, updateProfileValidation } = require('../validation/userValidation/userValidation');
const { addOTP, deleteOTP } = require('../models/otp');
const { sendEmail } = require("../utils/mailer");
const { hash, compare } = require("bcrypt");
const { MediaModel } = require("../models/media");


exports.register = async (req, res, next) => {
    const body = parseBody(req.body);
    const { error } = registerUserValidation.validate(body);

    if (error) {
        return next({
            status: false,
            statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
            message: error?.details[0].message,
        });
    }
    try {
        // checking if given email is already registered in platform 
        const userExist = await findUser({ email: body.email });


        if (userExist) {
            return next({
                status: false,
                statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
                message: "user already exists",
            });
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
        await sendEmail(body.email, "OTP", `your OTP is ${otpObject.otp}`);
        const userNew = await findUser({ email: body.email });

        generateResponse(
            { user: userNew, otp: otpObject.otp, },
            "OTP has been sent to your registered email",
            res)


    } catch (error) {
        next(new Error(error?.message));
    }
}


exports.login = async (req, res, next) => {
    const body = parseBody(req.body);

    const { error } = loginUserValidation.validate(body);

    if (error) {
        return next({
            data: {
                status: false
            },
            statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
            message: error?.details[0].message
        });
    }
    // destructuring => getting email , pass , device_token from body 

    const { email, password, device_token } = body;

    try {
        const user = await findUser({ email }).select("+password");
        if (!user)
            return next({
                status: false,
                statusCode: STATUS_CODE.BAD_REQUEST,
                message: "User not found"
            });
        const isMatch = await compare(password, user.password);
        if (!isMatch)
            return next({
                status: false,
                statusCode: STATUS_CODE.BAD_REQUEST,
                message: "Invalid credentials",
            })

        if (!user.isVerified)
            return next({
                status: false,
                statusCode: STATUS_CODE.BAD_REQUEST,
                message: "Please verify your account to login",

                data: { is_verified: false, }

            });

        if (!user.is_completed) {
            const token = generateToken(user);

            return next({
                statusCode: STATUS_CODE.BAD_REQUEST,
                staus: false,
                message: "Please complete your profile to login",
                data: { is_completed: false, role: user.role, token: token },
            });
        }

        await updateUserById(user._id, {
            $set: { device_token: device_token }
        });

        let User = findUser({ _id: user._id });
        const token = generateToken(user);

        generateResponse(
            { User, token },
            "Login successful",
            res
        );

    } catch (e) {
        next(new Error(e.message));
    }


}


exports.updateProfile = async (req, res, next) => {
    const body = parseBody(req.body);

    const {
        full_name,
        phone_number,
        location,
        facebook,
        instagram,
        userId,
        longitude,
        latitude,
        bio, } = body;


    const { error } = updateProfileValidation.validate(body);
    if (error)
        return next({
            status: false,
            statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
            message: error.details[0].message

        });
    // Check if there are any fields to update
    if (!Object.keys(body).length)
        return next({
            status: false,
            statusCode: STATUS_CODE.BAD_REQUEST,
            message: "Invalid Data"
        });
    console.log("this is role", req.user.role);
    //    validate the request body
    if (req.body.role == owner) {
        try {
            // Update other fields from req body 
            let updateField = {};
            updateField.fullName = full_name;
            updateField.phone_number = phone_number;
            updateField.facebook = facebook;
            updateField.instagram = instagram;
            updateField.address = location;
            updateField.bio = bio;
            // Check if longitude and latitude are provided
            if (longitude && latitude) {
                // Convert longitude and latitude to numbers
                let lng = parseFloat(longitude);
                let lat = parseFloat(latitude);
                // Set location field as a geospatial point
                updateField.coordinates = {
                    type: "Point",
                    coordinates: [lng, lat],

                };
                // If location is provided as a string, set it directly

            }
            if (!req.files) {
                return next({
                    status: false,
                    statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
                    message: "no file attached",
                });
            }
            if (req.files) {
                console.log("this is files", req.files);
            }


            if (req.files && req.files.profile_image) {
                console.log("we are inside profile image");
                const profileImageFile = req.files.profileImage[0];
                const profileImage = new MediaModel({
                    file: profileImageFile.path,
                    fileType: "Image",
                    userId: userId
                });
                const saveProfileImage = await profileImage.save();
                console.log("we are inside profile image", savedProfileImage);
                updateField.profileImage = saveProfileImage._id;
            }
            if (req.files && req.files.ssn_image) {
                console.log("we are inside ssn_image");

                const ssn_image = [];
                for (const ssn_Image of req.files.ssn_image) {

                    const ssnImage = new MediaModel({
                        file: ssn_Image.path,
                        fileType: "Image",
                        userId: userId
                    });
                    // const saveProfileImage = await profileImage.save();
                    await ssnImage.save();
                    ssn_image.push(ssnImage._id)

                }
                updateField.ssn_image = ssn_image;





            }


        } catch (e) {
            next(new Error(error.message));
        }
    }

} 