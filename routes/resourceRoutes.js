const express = require('express');

const resourceController = require('../controllers/resource');

const router = express.Router();

router.route('/').get(resourceController.getResource);

module.exports = router;
