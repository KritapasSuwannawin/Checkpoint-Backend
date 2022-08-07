const express = require('express');

const memberController = require('../controllers/member');

const router = express.Router();

router.route('/email/verify').get(memberController.getEmailVerificationCodeV1);

router.route('/signup').post(memberController.signUpMemberV1);

router.route('/signin').post(memberController.signInMemberV1);

router.route('/password/forget').get(memberController.getForgetPasswordVerificationCodeV1);
router.route('/password').put(memberController.resetPasswordV1);

router.route('/setting').put(memberController.updateSettingV1);

router.route('/profile').put(memberController.updateProfileV1);

router.route('/feedback/status').get(memberController.getFeedbackStatusV1);
router.route('/feedback').post(memberController.recordFeedbackV1);

router.route('/issue').post(memberController.recordIssueV1);

router.route('/payment').post(memberController.handlePaymentBuyMeCoffeeV1);

router.route('/account/activate').post(memberController.activateAccountV1);

module.exports = router;
