const router = require("express").Router();

const { updateProfile } = require("../controller/user");
const authMiddleware = require("../middlewears/Auth");
const { ROLES } = require('../utils/constants');
const { handleMultipartData } = require("../utils/multipart");

class UserAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }
    setupRoutes() {
        const router = this.router;
        router.post("/complete-profile", authMiddleware(Object.values(ROLES)), handleMultipartData.fields([
            {
                name: "ssn_image",
                maxCount: 3,
            },
            {
                name: "profile_image",
                maxCount: 1,
            },
            {
                name: "backgroundImage",
                maxCount: 1
            }
        ]), updateProfile)
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/user';
    }
}
module.exports = UserAPI;