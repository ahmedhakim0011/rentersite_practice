'use strict';

const { Schema, model } = require('mongoose');

const logSchema = new Schema({
    timestamp: {
        type: String,
        default: Date.now
    },

    body: { type: String },
    message: { type: String },
    stack: { type: String }
});

const LogModel = model("log", logSchema);


class ErrorHandling {
    static notFound(req, res, next) {
        const error = new Error(`Not found - ${req.originalUrl}`);
        res.status(404);
        next(error);
    }
    static async errorHandler(err, req, res, next) {
        const statusCode = err?.statusCode ? err.statusCode : 500;
        const error = new Error(err?.message || "Internal Server Error");

        const log = new LogModel({
            body: JSON.stringify(req.body),
            message: err?.message,
            stack: error.stack
        });

        try {
            await log.save();
        } catch (e) {
            console.error('Error saving log:', error);
        }


        return res.status(statusCode).json({
            status: false,
            message: error?.message,
            data: err?.data || {}
        });

    }
}

module.exports = ErrorHandling;