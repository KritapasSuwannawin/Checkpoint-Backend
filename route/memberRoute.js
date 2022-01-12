const express = require('express');

const memberController = require('../controllers/member');

const router = express.Router();

router.route('/verification').post(memberController.memberVerification);
router.route('/signup').post(memberController.memberSignUp);
router.route('/signin').post(memberController.memberSignIn);
router.route('/payment').post(memberController.memberPayment);
router.route('/setting').post(memberController.memberSetting);
router.route('/profile').post(memberController.memberProfile);
router.route('/review').post(memberController.memberReview);

module.exports = router;
