const { Router } = require('express');
const authMiddleware = require("../middlewears/Auth");
const { ROLES } = require("../utils/constants");
const { handleMultipartData } = require("../utils/multipart");
const { addProperty } = require('../controller/property');

class PropertyApi {
    constructor() {
        this.router = new Router();
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;

        // Add proeprty
        router.post('/add-property', authMiddleware([ROLES.OWNER]), handleMultipartData.fields([{ name: 'media', maxCount: 100 }]), addProperty);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return "/property"
    }
}

module.exports = PropertyApi;