const postgresql = require('../postgresql/postgresql');

exports.adminFeedback = (req, res) => {
  const feedbackPromise = new Promise((resolve, reject) => {
    postgresql.query('SELECT * FROM feedback order by id;', (err, result) => {
      resolve({ title: 'main_feedback', data: result.rows });
    });
  });

  const feedbackAfterTrialPremiumPromise = new Promise((resolve, reject) => {
    postgresql.query('SELECT * FROM feedback_after_trial_premium order by id;', (err, result) => {
      resolve({ title: 'premium_member_feedback', data: result.rows });
    });
  });

  const feedbackAfterTrialStandardPromise = new Promise((resolve, reject) => {
    postgresql.query('SELECT * FROM feedback_after_trial_standard order by id;', (err, result) => {
      resolve({ title: 'standard_member_feedback', data: result.rows });
    });
  });

  const feedbackFiveMinutePromise = new Promise((resolve, reject) => {
    postgresql.query('SELECT * FROM feedback_five_minute order by id;', (err, result) => {
      resolve({ title: 'five_minute_feedback', data: result.rows });
    });
  });

  const feedbackTrialLastDayPromise = new Promise((resolve, reject) => {
    postgresql.query('SELECT * FROM feedback_trial_last_day order by id;', (err, result) => {
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
  postgresql.query('SELECT * FROM member_issue order by id;', (err, result) => {
    res.json({ title: 'member_issue', data: result.rows });
  });
};

exports.adminMember = (req, res) => {
  postgresql.query(
    'SELECT m.id, m.registration_date, ma.email, ma.login_method FROM member m INNER JOIN member_authentication ma ON m.id = ma.id ORDER BY m.id',
    (err, result) => {
      res.json({ title: 'member', data: result.rows });
    }
  );
};
