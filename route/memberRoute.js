const express = require('express');

const memberController = require('../controllers/member');

const router = express.Router();

router.route('/login').post(memberController.memberLogin);
router.route('/upgrade').post(memberController.memberUpgrade);
router.route('/setting').post(memberController.memberSetting);

module.exports = router;
