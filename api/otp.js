const { Router } = require('express');
const {generateOTP, verifyOTP} = require("../controller/otp");
const {upload} = require("../utils/index")



class OTPApi {
    constructor(){
        this.router = new Router();
        this.setupRoutes();
    }


    setupRoutes(){
        const router = this.router;
        router.use(upload().none());

        router.post('/generateOTP', generateOTP);
        router.post('/verify', verifyOTP);
    }


    getRouter(){
        return this.router;
    }

    getRouterGroup(){
        return '/otp';
    }
}

module.exports = OTPApi;