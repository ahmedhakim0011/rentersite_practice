'use strict';

const { Router } = require('express');
const { register } = require("../controller/user");

const { upload } = require("../utils/index");


class AuthAPI {
    constructor() {
        this.router = new Router();
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        router.post('/register', upload('users').single('image'), register);
        // router.post('/login', upload('users').single('image'), register);
        // router.post('/verifyOTP', upload('users').single('image'), register);

    }

    getRouter() {
        return this.router;
    }
    getRouterGroup() {
        return 'auth';
    }
}


module.exports = AuthAPI ;