const express = require('express');

const memberController = require('../controllers/member');

const router = express.Router();

router.route('/login').post(memberController.memberLogin);

module.exports = router;
