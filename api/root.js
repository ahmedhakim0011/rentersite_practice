'user strict';

const { Router } = require('express');
const { defaultHandler } = require('../controller/root');

class RootAPI {
    constructor() {
        this.router = Router();
        this.setupRouts();
    }

    setupRouts() {
        let router = this.router;
        router.get('/', defaultHandler);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/';
    }
}

module.exports = RootAPI;