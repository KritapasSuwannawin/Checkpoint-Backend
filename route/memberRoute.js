const express = require('express');

const memberController = require('../controllers/member');

const router = express.Router();

router.route('/verification').post(memberController.memberVerification);
router.route('/verification-mobile').post(memberController.memberVerificationMobile);
router.route('/signup').post(memberController.memberSignUp);
router.route('/signin').post(memberController.memberSignIn);
router.route('/forget-password').post(memberController.memberForgetPassword);
router.route('/forget-password-mobile').post(memberController.memberForgetPasswordMobile);
router.route('/reset-password').post(memberController.memberResetPassword);
router.route('/setting').post(memberController.memberSetting);
router.route('/profile').post(memberController.memberProfile);
router.route('/check-feedback').post(memberController.memberCheckFeedback);
router.route('/feedback').post(memberController.memberFeedback);
router.route('/issue').post(memberController.memberIssue);
router.route('/payment').post(memberController.memberPayment);
router.route('/activation').post(memberController.memberActivation);

module.exports = router;
