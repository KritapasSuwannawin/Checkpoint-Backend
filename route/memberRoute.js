const express = require('express');

const memberController = require('../controllers/member');

const router = express.Router();

router.route('/login').post(memberController.memberLogin);
router.route('/upgrade').post(memberController.memberUpgrade);
router.route('/setting').post(memberController.memberSetting);
router.route('/review').post(memberController.memberReview);

module.exports = router;
