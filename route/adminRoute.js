const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

router.route('/feedback').get(adminController.adminFeedback);
router.route('/issue').get(adminController.adminIssue);

module.exports = router;
