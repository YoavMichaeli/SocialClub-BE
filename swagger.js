"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swaggerAutogen = require('swagger-autogen')();
const doc = {
    info: {
        title: 'SocialClub API',
        description: 'A modern social network platform'
    },
    host: 'localhost:8080'
};
const outputFile = './swagger-output.json';
const routes = ['./src/app.ts'];
/* NOTE: If you are using the express Router, you must pass in the 'routes' only the
root file where the route starts, such as index.js, app.js, routes.js, etc ... */
swaggerAutogen(outputFile, routes, doc);
