const postgresql = require('../postgresql/postgresql');

exports.adminFeedback = (req, res) => {
  const feedbackPromise = new Promise((resolve, reject) => {
    postgresql.query('SELECT * FROM feedback;', (err, result) => {
      resolve({ title: 'main_feedback', data: result.rows });
    });
  });

  const feedbackAfterTrialPremiumPromise = new Promise((resolve, reject) => {
    postgresql.query('SELECT * FROM feedback_after_trial_premium;', (err, result) => {
      resolve({ title: 'premium_member_feedback', data: result.rows });
    });
  });

  const feedbackAfterTrialStandardPromise = new Promise((resolve, reject) => {
    postgresql.query('SELECT * FROM feedback_after_trial_standard;', (err, result) => {
      resolve({ title: 'standard_member_feedback', data: result.rows });
    });
  });

  const feedbackFiveMinutePromise = new Promise((resolve, reject) => {
    postgresql.query('SELECT * FROM feedback_five_minute;', (err, result) => {
      resolve({ title: 'five_minute_feedback', data: result.rows });
    });
  });

  const feedbackTrialLastDayPromise = new Promise((resolve, reject) => {
    postgresql.query('SELECT * FROM feedback_trial_last_day;', (err, result) => {
      resolve({ title: 'trial_last_day_feedback', data: result.rows });
    });
  });

  Promise.all([
    feedbackPromise,
    feedbackFiveMinutePromise,
    feedbackTrialLastDayPromise,
    feedbackAfterTrialStandardPromise,
    feedbackAfterTrialPremiumPromise,
  ]).then((values) => {
    res.json(values);
  });
};

exports.adminIssue = (req, res) => {
  postgresql.query('SELECT * FROM member_issue;', (err, result) => {
    res.json({ title: 'member_issue', data: result.rows });
  });
};
