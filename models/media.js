const { Schema, model } = require('mongoose');

// Define Media Schema
const mediaSchema = new Schema({
    file: { 
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        enum: ["Image", "Video"], 
        default: "Image"
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users",  // Adjust if your user model is named differently
        required: true
    }
}, { timestamps: true });

// Create the Media model
const MediaModel = model("Media", mediaSchema);

// Create Media
exports. createMedia = (obj) => MediaModel.create(obj);

// Find Media by ID
exports.findMediaById = (query) => MediaModel.findById(query).lean();

// Update Media by ID
exports.updateMediaById = (mediaId, obj) => MediaModel.findByIdAndUpdate(mediaId, obj, { new: true });
