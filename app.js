const express = require('express');
const cors = require('cors');

const resourceRouterV1 = require('./route/resourceRouteV1');
const memberRouterV1 = require('./route/memberRouteV1');
const adminRouterV1 = require('./route/adminRouteV1');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/v1/resource', resourceRouterV1);
app.use('/v1/member', memberRouterV1);
app.use('/v1/admin', adminRouterV1);

module.exports = app;
