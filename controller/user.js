const { createUser, findUser, updateUserById, generateToken } = require('../models/user');
const { STATUS_CODE } = require('../utils/constants')
const { generateRandomOTP, parseBody, generateResponse } = require('../utils/index');
const { registerUserValidation, loginUserValidation, updateProfileValidation } = require('../validation/userValidation/userValidation');
const { addOTP, deleteOTP } = require('../models/otp');
const { sendEmail } = require("../utils/mailer");
const { hash, compare } = require("bcrypt");
const { createMedia } = require("../models/media");


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

                data: { isVerified: false, }

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

        let User = await findUser({ _id: user._id });

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
    const userId = req.user.id;


    const {
        full_name,
        phone_number,
        location,
        facebook,
        instagram,
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
    // if (!Object.keys(body).length)
    //     return next({
    //         status: false,
    //         statusCode: STATUS_CODE.BAD_REQUEST,
    //         message: "Invalid Data"
    //     });
    console.log("this is role", req.user.role);
    //    validate the request body
    if (req.user.role == "owner") {
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
                const profileImageFile = req.files.profile_image[0];
                const profileImage = await createMedia({
                    file: profileImageFile.path,
                    fileType: "Image",
                    userId: userId
                });
                const saveProfileImage = await profileImage.save();
                console.log("we are inside profile image", saveProfileImage);
                updateField.profileImage = saveProfileImage._id;
            }
            if (req.files && req.files.ssn_image) {
                console.log("we are inside ssn_image");

                const ssnImageList = [];
                for (const ssn_Image of req.files.ssn_image) {

                    const ssnImage = await createMedia({
                        file: ssn_Image.path,
                        fileType: "Image",
                        userId: userId
                    });
                    // const saveProfileImage = await profileImage.save();
                    const saveSSNImage = await ssnImage.save();
                    ssnImageList.push(saveSSNImage._id)

                }
                updateField.ssn_image = ssnImageList;

            }

            if (req.files && req.files.backgroundImage) {
                console.log("we are inside background file");
                const backgoundImageFile = req.files.backgroundImage[0];
                const background_Image = await createMedia({
                    file: backgoundImageFile.path,
                    fileType: "Image",
                    userId: userId
                });
                const saveBackgroundImage = await background_Image.save();
                updateField.backgroundImage = saveBackgroundImage._id;
            }

            updateField.is_completed = true;


            let User = await updateUserById(userId, {
                $set: updateField,
            }).populate("ssn_image profileImage backgroundImage");

            const token = generateToken(User);

            generateResponse({ User, token }, "Profile updated successfully", res)



        } catch (e) {
            next(new Error(e.message));
        }
    } else {
        try {
            let updateFields = {};

            // Upload profile image if provided

            // Update other fields from the request body
            updateFields.fullName = full_name;
            updateFields.phone_number = phone_number;
            updateFields.facebook = facebook;
            updateFields.instagram = instagram;
            updateFields.bio = bio;

            updateFields.address = location;

            // Check if longitude and latitude are provided
            if (longitude && latitude) {
                // Convert longitude and latitude to numbers
                let long = parseFloat(longitude);
                let lat = parseFloat(latitude);
                // Set location field as a geospatial point
                updateFields.coordinates = {
                    type: "Point",
                    coordinates: [long, lat],
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
                const profileImageFile = req.files.profile_image[0];
                const profileImage = await createMedia({
                    file: profileImageFile.path,
                    fileType: "Image", // Assuming award images are always images
                    userId: userId,
                });
                const savedProfileImage = await profileImage.save();
                console.log("we are inside profile image", savedProfileImage);

                updateFields.profileImage = savedProfileImage._id;
            }

            if (req.files && req.files.ssn_image) {
                var ssnnimage = []
                for (const ssn_image of req.files.ssn_image) {
                    const ssnImage = await createMedia({
                        file: ssn_image.path,
                        fileType: "Image", // Assuming award images are always images
                        userId: userId,
                    });
                    const saveSSNImage = await ssnImage.save();
                    ssnnimage.push(saveSSNImage._id)
                }
                updateFields.ssn_image = ssnnimage;
            }

            if (req.files && req.files.backgroundImage) {
                console.log("we are inside profile image");

                const backgroundImage = req.files.backgroundImage[0];
                const background_Image = await createMedia({
                    file: backgroundImage.path,
                    fileType: "Image", // Assuming award images are always images
                    userId: userId,
                });
                const savedBackgroundImage = await background_Image.save();
                console.log("we are inside profile image", savedBackgroundImage);

                updateFields.backgroundImage = savedBackgroundImage._id;
            }

            updateFields.is_completed = true;
            // Update the user profile
            // Update the user profile

            let User = await updateUserById(req.user.id, {
                $set: updateFields,
            }).populate("ssn_image profileImage backgroundImage");

            const token = generateToken(User);
            // req.session

            generateResponse(
                { User, token },
                "Profile updated successfully",
                res
            );
        } catch (error) {
            next(new Error(error.message));
        }
    }

}





exports.getHomeScreenPropertiesForTenant = async () => {
    try {

        const { status } = req.body;

        const responcseData = { propertyListFirst: [], propertyListSecond: [] };
        let query;
        if (status === "nearMe" && long && lat) {
            query = {
                coordinates: {
                    $geoWithin: {
                        $centerSphere: [[long, lat], 1 / 6378.1],
                    },
                }
            };
        }




        const fetchProperties = async (query = {}) => {
const properties = await getPropertyFromTenant(query).sort({createdAt : -1});

        }
    } catch (e) {
        next(e.message)
    }
}