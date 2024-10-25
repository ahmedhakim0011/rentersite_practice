'use strict'


let { Schema, model } = require("mongoose");
const { PROPERTY_STATUS } = require("../utils/constants");
const propertySchema = new Schema({
    title: {
        type: String,
        default: null
    },
    media: [{ type: Schema.Types.ObjectId, ref: "Meida" }],
    description: { type: String, defalut: null },
    Bedrooms: { type: Number, default: null },
    Bathrooms: { type: Number, default: null },
    size: { type: String, default: null },
    parking: { type: String, default: null },
    farnished: { type: String, default: null },
    coordinates: { type: { type: String }, coordinates: [Number] },
    city: { type: String, default: null },
    property_type: { type: String, default: null },
    user_id: { type: Schema.Types.ObjectId, ref: 'user' },
    status: { type: String, default: PROPERTY_STATUS.AVAILABLE },
    price: { type: Number, default: null },
    isDeleted: { type: Schema.Types.Boolean, default: false }

}, { timestamps: true });

const PropertyModel = model("Property", propertySchema);

// create Property

exports.createProperty = (obj) => PropertyModel.create(obj);