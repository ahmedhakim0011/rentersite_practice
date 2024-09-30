const { Router } = require('express');
const rootApi = require('./root');
const authApi = require('./auth');



class API {
    constructor(app) {
        this.app = app;
        this.router = Router();
        this.routeGroups = [];
    }


    loadRouteGroups() {
        this.routeGroups.push(new rootApi());
        this.routeGroups.push(new authApi());

    }

    setContentType(req, res, next) {
        res.set('Content-Type, application/json');
        next();
    }

    registerGroups() {
        this.loadRouteGroups();
        this.routeGroups.forEach((rg) => {
            console.log('Route group: ' + rg.getRouterGroup());
            this.app.use('/api' + rg.getRouterGroup(), this.setContentType, rg.getRouter());
        });
    }

}

module.exports = API;