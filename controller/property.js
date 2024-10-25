const { createProperty } = require("../models/property");
const { parseBody, generateResponse } = require("../utils/index");
const { findUser } = require("../models/user");
const { createMedia } = require("../models/media");
const { STATUS_CODE } = require("../utils/constants");
const {
    addPropertyValidation,
  } = require("../validation/userValidation/userValidation");



exports.addProperty = async (req, res, next) => {


    try {
        const { title, media,
            description,
            Bedrooms,
            Bathrooms,
            size,
            parking,
            farnished,
            longitude,
            latitude,
            city,
            property_type,
           
            price
        } = parseBody(req.body);

        const { error } = addPropertyValidation.validate(req.body);

        if (error) {
            return next({
                status: false,
                message: error.details[0].message
            });
        }

        const userExist = await findUser({ _id: req.user.id });
        if (!userExist) {
            return next({
                status: false,
                statusCode: STATUS_CODE.BAD_REQUEST,
                message: "User does not exist"
            })
        }

        const propertyObject = {
            title,
            media: [],
            description,
            Bedrooms,
            Bathrooms,
            size,
            parking,
            farnished,
            coordinates: {},
            city,
            property_type,
            user_id: req.user._id,
        
            price,

        }

        if (longitude && latitude) {
            let long = parseFloat(longitude);
            let lat = parseFloat(latitude);

            propertyObject.coordinates = {
                type: "Point",
                coordinates: [long, lat],
            }

        }


        if (req.files && req.files.media) {
            const propertyImages = req.files.media;
            for (const file of propertyImages) {
                const propertyImage = await createMedia({
                    file: file.path,
                    fileType: "Image", // Assuming award images are always images
                    userId: req.user.id,
                  });

                propertyObject.media.push(propertyImage);
            }


        }

        const property = await createProperty(propertyObject);

        generateResponse(property, "Property created successfully", res);



    } catch (e) {
        next(new Error(e.message));
    }


}