const postgres = require('../postgres/postgres');

exports.adminFeedback = (_, res) => {
  const feedbackPromise = new Promise((resolve, reject) => {
    postgres.query('SELECT * FROM feedback order by id;', (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve({ title: 'main_feedback', data: result.rows });
    });
  });

  const feedbackAfterTrialPremiumPromise = new Promise((resolve, reject) => {
    postgres.query('SELECT * FROM feedback_after_trial_premium order by id;', (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve({ title: 'premium_member_feedback', data: result.rows });
    });
  });

  const feedbackAfterTrialStandardPromise = new Promise((resolve, reject) => {
    postgres.query('SELECT * FROM feedback_after_trial_standard order by id;', (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve({ title: 'standard_member_feedback', data: result.rows });
    });
  });

  const feedbackFiveMinutePromise = new Promise((resolve, reject) => {
    postgres.query('SELECT * FROM feedback_five_minute order by id;', (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve({ title: 'five_minute_feedback', data: result.rows });
    });
  });

  const feedbackTrialLastDayPromise = new Promise((resolve, reject) => {
    postgres.query('SELECT * FROM feedback_trial_last_day order by id;', (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve({ title: 'trial_last_day_feedback', data: result.rows });
    });
  });

  Promise.all([
    feedbackPromise,
    feedbackFiveMinutePromise,
    feedbackTrialLastDayPromise,
    feedbackAfterTrialStandardPromise,
    feedbackAfterTrialPremiumPromise,
  ])
    .then((data) => {
      res.json(data);
    })
    .catch(() => {
      res.send('Server error');
    });
};

exports.adminIssue = (_, res) => {
  postgres.query('SELECT * FROM member_issue order by id;', (err, result) => {
    if (err) {
      res.send('Server error');
      return;
    }

    res.json({ title: 'issue', data: result.rows });
  });
};

exports.adminMember = (req, res) => {
  const { receive_news } = req.query;

  let where = '';

  if (receive_news) {
    where += `WHERE m.receive_news = ${receive_news}`;
  }

  postgres.query(
    `SELECT m.id, m.registration_date, ma.email, ma.login_method FROM member m INNER JOIN member_authentication ma ON m.id = ma.id ${where} ORDER BY m.id`,
    (err, result) => {
      if (err) {
        res.send('Server error');
        return;
      }

      res.json({ title: 'member', data: result.rows });
    }
  );
};
