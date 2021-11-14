const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const resourceRouter = require('./route/resourceRoute');
const memberRouter = require('./route/memberRoute');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(cors());

app.use('/api/resource', resourceRouter);
app.use('/api/member', memberRouter);

module.exports = app;
