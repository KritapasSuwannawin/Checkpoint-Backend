const express = require('express');

const resourceController = require('../controllers/resource');

const router = express.Router();

router.route('/').get(resourceController.getResourceV1);

module.exports = router;
