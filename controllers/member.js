const postgresql = require('../postgresql/postgresql');
const aws = require('aws-sdk');
const crypto = require('crypto-js');
const omise = require('omise')({
  publicKey: process.env.omise_public_key,
  secretKey: process.env.omise_secret_key,
});

const SESConfig = {
  apiVersion: '2010-12-01',
  accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  region: process.env.AWS_SES_REGION,
};

function sendMail(to, subject, html) {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: process.env.no_reply_email,
  };

  return new aws.SES(SESConfig).sendEmail(params).promise();
}

exports.memberVerification = (req, res) => {
  const email = req.body.email;
  const loginMethod = req.body.loginMethod;

  const selectMemberAuthenticationPromise = new Promise((resolve, reject) => {
    postgresql.query(
      `SELECT * FROM member_authentication WHERE email = '${email}' and login_method = '${loginMethod}';`,
      (err, result) => {
        resolve(
          result
            ? result.rows.map((memberAuthentication) => {
                return {
                  id: memberAuthentication.id,
                  email: memberAuthentication.email,
                  password: memberAuthentication.password,
                  loginMethod: memberAuthentication.login_method,
                };
              })
            : err
        );
      }
    );
  });

  selectMemberAuthenticationPromise.then((data) => {
    if (data.length === 0) {
      function makeId(length) {
        let result = '';
        const characters = '0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
      }

      const verificationCode = makeId(6);
      const sendMailPromise = sendMail(
        email,
        "Checkpoint's Verification Code",
        `<h3 style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-weight: bold; font-size: 24px; line-height: 36px; margin: 16px 0px; color: rgb(30, 32, 38);"><span class="il">Confirm</span> Your Registration</h3>
      <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">Welcome to Checkpoint!<br>Here is your account activation code:</p>
      <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br><span style="padding: 5px 0px; font-size: 20px; font-weight: bolder; color: rgb(245, 122, 232);">${verificationCode}</span></p>
      <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br></p>
      <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">For further assistance, please contact us at support@checkpoint.tokyo<br>This is an automated message, please do not reply.</p>`
      );
      sendMailPromise
        .then(() => {
          res.json({
            verificationCode: crypto.AES.encrypt(verificationCode, process.env.checkpoint_security_key).toString(),
          });
        })
        .catch(() => {
          res.json({
            message: 'error during authentication',
          });
        });
    } else if (data.length === 1) {
      res.json({
        message: 'account already exist',
      });
    } else {
      res.json({
        message: 'error during authentication',
      });
    }
  });
};

exports.memberVerificationMobile = (req, res) => {
  const email = req.body.email;
  const loginMethod = req.body.loginMethod;

  const selectMemberAuthenticationPromise = new Promise((resolve, reject) => {
    postgresql.query(
      `SELECT * FROM member_authentication WHERE email = '${email}' and login_method = '${loginMethod}';`,
      (err, result) => {
        resolve(
          result
            ? result.rows.map((memberAuthentication) => {
                return {
                  id: memberAuthentication.id,
                  email: memberAuthentication.email,
                  password: memberAuthentication.password,
                  loginMethod: memberAuthentication.login_method,
                };
              })
            : err
        );
      }
    );
  });

  selectMemberAuthenticationPromise.then((data) => {
    if (data.length === 0) {
      function makeId(length) {
        let result = '';
        const characters = '0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
      }

      const verificationCode = makeId(6);
      const sendMailPromise = sendMail(
        email,
        "Checkpoint's Verification Code",
        `<h3 style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-weight: bold; font-size: 24px; line-height: 36px; margin: 16px 0px; color: rgb(30, 32, 38);"><span class="il">Confirm</span> Your Registration</h3>
      <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">Welcome to Checkpoint!<br>Here is your account activation code:</p>
      <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br><span style="padding: 5px 0px; font-size: 20px; font-weight: bolder; color: rgb(245, 122, 232);">${verificationCode}</span></p>
      <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br></p>
      <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">For further assistance, please contact us at support@checkpoint.tokyo<br>This is an automated message, please do not reply.</p>`
      );

      sendMailPromise
        .then(() => {
          res.json({
            verificationCode,
          });
        })
        .catch(() => {
          res.json({
            message: 'error during authentication',
          });
        });
    } else if (data.length === 1) {
      res.json({
        message: 'account already exist',
      });
    } else {
      res.json({
        message: 'error during authentication',
      });
    }
  });
};

exports.memberSignUp = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const loginMethod = req.body.loginMethod;
  const receiveNews = req.body.receiveNews;

  const selectMemberAuthenticationPromise = new Promise((resolve, reject) => {
    postgresql.query(
      `SELECT * FROM member_authentication WHERE email = '${email}' and login_method = '${loginMethod}';`,
      (err, result) => {
        resolve(
          result
            ? result.rows.map((memberAuthentication) => {
                return {
                  id: memberAuthentication.id,
                  email: memberAuthentication.email,
                  password: memberAuthentication.password,
                  loginMethod: memberAuthentication.login_method,
                };
              })
            : err
        );
      }
    );
  });

  selectMemberAuthenticationPromise.then((data) => {
    if (data.length === 0) {
      const addNewMemberPromise = new Promise((resolve, reject) => {
        postgresql.query(
          `CALL add_new_member('${email}', '${password}', '${loginMethod}', '${email.split('@')[0]}', ${receiveNews});`,
          (err, result) => {
            resolve(result ? result : err);
          }
        );
      });

      addNewMemberPromise.then(() => {
        const selectMemberPromise = new Promise((resolve, reject) => {
          postgresql.query(
            `SELECT * FROM member m
            WHERE m.id = (SELECT id FROM member_authentication WHERE email = '${email}' AND password = MD5('${password}') AND login_method = '${loginMethod}');`,
            (err, result) => {
              resolve(
                result
                  ? result.rows.map((member) => {
                      return {
                        id: member.id,
                        email,
                        username: member.username,
                        avatarId: member.avatar_id,
                        memberType: 'free',
                        registrationDate: member.registration_date,
                      };
                    })
                  : err
              );
            }
          );
        });

        selectMemberPromise.then((data) => {
          res.json({
            data,
          });
        });
      });
    } else if (data.length === 1) {
      res.json({
        message: 'account already exist',
      });
    } else {
      res.json({
        message: 'error during authentication',
      });
    }
  });
};

exports.memberSignIn = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const loginMethod = req.body.loginMethod;

  const selectMemberAuthenticationPromise = new Promise((resolve, reject) => {
    postgresql.query(
      `SELECT * FROM member_authentication WHERE email = '${email}' and login_method = '${loginMethod}';`,
      (err, result) => {
        resolve(
          result
            ? result.rows.map((memberAuthentication) => {
                return {
                  id: memberAuthentication.id,
                  email: memberAuthentication.email,
                  password: memberAuthentication.password,
                  loginMethod: memberAuthentication.login_method,
                };
              })
            : err
        );
      }
    );
  });

  selectMemberAuthenticationPromise.then((data) => {
    if (data.length === 0) {
      res.json({
        message: 'account not exist',
      });
    } else if (data.length === 1) {
      postgresql.query(
        `SELECT verify_password('${password}', '${email}', '${loginMethod}') AS verification;`,
        (err, result) => {
          if (result) {
            if (!result.rows[0].verification) {
              res.json({
                message: 'incorrect password',
              });
            } else {
              const checkMemberPaymentPromise = new Promise((resolve, reject) => {
                postgresql.query(
                  `SELECT * FROM member WHERE id = (SELECT id FROM member_authentication WHERE email = '${email}' AND password = MD5('${password}') AND login_method = '${loginMethod}');`,
                  (err, result) => {
                    if (!result.rows[0].recent_payment_date || !result.rows[0].omise_schedule_id) {
                      resolve();
                    }

                    const currentTime = new Date().getTime();
                    const recentPaymentTime = new Date(result.rows[0].recent_payment_date).getTime();
                    const dateDifference = Math.floor((currentTime - recentPaymentTime) / (1000 * 60 * 60 * 24));

                    if (dateDifference > 35) {
                      omise.schedules.retrieve(result.rows[0].omise_schedule_id, (err, schedule) => {
                        if (!err && schedule.active) {
                          postgresql.query(
                            `UPDATE member SET recent_payment_date = (recent_payment_date + INTERVAL '1 MONTH')::date WHERE id = (SELECT id FROM member_authentication WHERE email = '${email}' AND password = MD5('${password}') AND login_method = '${loginMethod}');`,
                            (err, result) => {
                              resolve();
                            }
                          );
                        }
                      });
                    } else {
                      resolve();
                    }
                  }
                );
              });

              checkMemberPaymentPromise.then(() => {
                const selectMemberPromise = new Promise((resolve, reject) => {
                  postgresql.query(
                    `SELECT m.*, ms.background_id, ms.music_id, ms.music_category_id, ms.favourite_music_id_arr, ms.play_from_playlist, mc.name AS music_category
                  FROM member m 
                  INNER JOIN member_setting ms ON m.id = ms.id
                  LEFT JOIN music_category mc ON ms.music_category_id = mc.id
                  WHERE m.id = (SELECT id FROM member_authentication WHERE email = '${email}' AND password = MD5('${password}') AND login_method = '${loginMethod}');`,
                    (err, result) => {
                      let dateDifference = 100;
                      const recentPaymentDate = result.rows[0].recent_payment_date;

                      if (recentPaymentDate) {
                        const currentTime = new Date().getTime();
                        const recentPaymentTime = new Date(recentPaymentDate).getTime();
                        dateDifference = Math.floor((currentTime - recentPaymentTime) / (1000 * 60 * 60 * 24));
                      }

                      resolve(
                        result
                          ? result.rows.map((member) => {
                              return {
                                id: member.id,
                                email,
                                username: member.username,
                                avatarId: member.avatar_id,
                                memberType: dateDifference < 37 ? 'premium' : 'free',
                                registrationDate: member.registration_date,
                                backgroundId: member.background_id,
                                musicId: member.music_id,
                                musicCategoryId: member.music_category_id,
                                musicCategory: member.music_category,
                                favouriteMusicIdArr: member.favourite_music_id_arr,
                                playFromPlaylist: member.play_from_playlist,
                              };
                            })
                          : err
                      );
                    }
                  );
                });

                selectMemberPromise.then((data) => {
                  res.json({
                    data,
                  });
                });
              });
            }
          } else {
            res.json({
              message: 'error during authentication',
            });
          }
        }
      );
    } else {
      res.json({
        message: 'error during authentication',
      });
    }
  });
};

exports.memberForgetPassword = (req, res) => {
  const { email } = req.body;

  const selectMemberAuthenticationPromise = new Promise((resolve, reject) => {
    postgresql.query(
      `SELECT * FROM member_authentication WHERE email = '${email}' and login_method = 'email';`,
      (err, result) => {
        resolve(
          result
            ? result.rows.map((memberAuthentication) => {
                return {
                  id: memberAuthentication.id,
                  email: memberAuthentication.email,
                  password: memberAuthentication.password,
                  loginMethod: memberAuthentication.login_method,
                };
              })
            : err
        );
      }
    );
  });

  selectMemberAuthenticationPromise.then((data) => {
    if (data.length === 0) {
      res.json({
        message: 'account not exist',
      });
    } else if (data.length === 1) {
      function makeId(length) {
        let result = '';
        const characters = '0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
      }

      const verificationCode = makeId(6);
      const sendMailPromise = sendMail(
        email,
        "Checkpoint's Reset Password Verification Code",
        `<h3 style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-weight: bold; font-size: 24px; line-height: 36px; margin: 16px 0px; color: rgb(30, 32, 38);"><span class="il">Reset</span> Your Password</h3>
      <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">Here is your verification code:</p>
      <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br><span style="padding: 5px 0px; font-size: 20px; font-weight: bolder; color: rgb(245, 122, 232);">${verificationCode}</span></p>
      <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br></p>
      <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">For further assistance, please contact us at support@checkpoint.tokyo<br>This is an automated message, please do not reply.</p>`
      );

      sendMailPromise
        .then(() => {
          res.json({
            verificationCode: crypto.AES.encrypt(verificationCode, process.env.checkpoint_security_key).toString(),
          });
        })
        .catch(() => {
          res.json({
            message: 'error during authentication',
          });
        });
    } else {
      res.json({
        message: 'error during authentication',
      });
    }
  });
};

exports.memberForgetPasswordMobile = (req, res) => {
  const { email } = req.body;

  const selectMemberAuthenticationPromise = new Promise((resolve, reject) => {
    postgresql.query(
      `SELECT * FROM member_authentication WHERE email = '${email}' and login_method = 'email';`,
      (err, result) => {
        resolve(
          result
            ? result.rows.map((memberAuthentication) => {
                return {
                  id: memberAuthentication.id,
                  email: memberAuthentication.email,
                  password: memberAuthentication.password,
                  loginMethod: memberAuthentication.login_method,
                };
              })
            : err
        );
      }
    );
  });

  selectMemberAuthenticationPromise.then((data) => {
    if (data.length === 0) {
      res.json({
        message: 'account not exist',
      });
    } else if (data.length === 1) {
      function makeId(length) {
        let result = '';
        const characters = '0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
      }

      const verificationCode = makeId(6);
      const sendMailPromise = sendMail(
        email,
        "Checkpoint's Reset Password Verification Code",
        `<h3 style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-weight: bold; font-size: 24px; line-height: 36px; margin: 16px 0px; color: rgb(30, 32, 38);"><span class="il">Reset</span> Your Password</h3>
      <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">Here is your verification code:</p>
      <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br><span style="padding: 5px 0px; font-size: 20px; font-weight: bolder; color: rgb(245, 122, 232);">${verificationCode}</span></p>
      <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br></p>
      <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">For further assistance, please contact us at support@checkpoint.tokyo<br>This is an automated message, please do not reply.</p>`
      );

      sendMailPromise
        .then(() => {
          res.json({
            verificationCode: crypto.AES.encrypt(verificationCode, process.env.checkpoint_security_key).toString(),
          });
        })
        .catch(() => {
          res.json({
            message: 'error during authentication',
          });
        });
    } else {
      res.json({
        message: 'error during authentication',
      });
    }
  });
};

exports.memberResetPassword = (req, res) => {
  const { email, newPassword } = req.body;

  postgresql.query(
    `UPDATE member_authentication SET password = md5('${newPassword}') WHERE email = '${email}' and login_method = 'email';`,
    (err, result) => {
      err
        ? res.json({
            message: 'error during authentication',
          })
        : res.json({});
    }
  );
};

exports.memberPayment = async (req, res) => {
  try {
    const { memberId, email, token } = req.body;

    const customer = await omise.customers.create({
      email,
      description: email,
      card: token,
    });

    const date = new Date();
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.length > 1 ? `${date.getMonth() + 1}` : `0${date.getMonth() + 1}`;
    const day = `${date.getDate()}`.length > 1 ? `${date.getDate()}` : `0${date.getDate()}`;

    const schedule = await omise.schedules.create({
      livemode: process.env.omise_livemode === 'true',
      every: 1,
      period: 'month',
      on: {
        days_of_month: [date.getDate() < 29 ? date.getDate() : 1],
      },
      start_date: `${year}-${month}-${day}`,
      end_date: `${year + 100}-${month}-${day}`,
      charge: {
        customer: customer.id,
        amount: 399,
        currency: 'usd',
        description: 'Subscription fee',
      },
    });

    if (schedule.active || schedule.status === 'running' || schedule.status === 'expiring') {
      postgresql.query(
        `UPDATE member SET omise_schedule_id = '${schedule.id}', omise_customer_id = '${customer.id}', recent_payment_date = current_date WHERE id = ${memberId};`,
        (err, result) => {
          res.json({
            active: true,
          });
        }
      );
    } else {
      res.json({
        message: 'error during payment',
      });
    }
  } catch (err) {
    res.json({
      message: 'error during payment',
    });
  }
};

exports.memberSetting = (req, res) => {
  const backgroundId = req.body.backgroundId;
  const musicId = req.body.musicId;
  const musicCategory = req.body.musicCategory;
  const memberId = req.body.memberId;
  const favouriteMusicIdArr = req.body.favouriteMusicIdArr;
  const playFromPlaylist = req.body.playFromPlaylist;

  postgresql.query(
    `UPDATE member_setting SET background_id = '${backgroundId}', music_id = ${musicId}, music_category_id = (SELECT id FROM music_category WHERE name = '${musicCategory}'), favourite_music_id_arr = ARRAY[${favouriteMusicIdArr}], play_from_playlist = ${playFromPlaylist} WHERE id = ${memberId};`,
    (err, result) => {
      res.json({});
    }
  );
};

exports.memberProfile = (req, res) => {
  const memberId = req.body.memberId;
  const avatarId = req.body.avatarId;

  postgresql.query(`UPDATE member SET avatar_id = '${avatarId}' WHERE id = ${memberId};`, (err, result) => {
    res.json({});
  });
};

exports.memberReview = (req, res) => {
  const memberId = req.body.memberId;
  const numberBackgroundNotEnough = req.body.numberBackgroundNotEnough;
  const numberMusicNotEnough = req.body.numberMusicNotEnough;
  const numberAmbienceNotEnough = req.body.numberAmbienceNotEnough;
  const qualityBackgroundNotEnough = req.body.qualityBackgroundNotEnough;
  const qualityMusicNotEnough = req.body.qualityMusicNotEnough;
  const qualityAmbienceNotEnough = req.body.qualityAmbienceNotEnough;
  const slowDownloadSpeed = req.body.slowDownloadSpeed;
  const difficultToNavigate = req.body.difficultToNavigate;
  const operationNotSmooth = req.body.operationNotSmooth;
  const otherSuggestion = req.body.otherSuggestion;
  const email = req.body.email;

  postgresql.query(
    `INSERT INTO member_satisfaction VALUES (${memberId}, ${numberBackgroundNotEnough}, ${numberMusicNotEnough}, ${numberAmbienceNotEnough}, ${qualityBackgroundNotEnough}, ${qualityMusicNotEnough}, ${qualityAmbienceNotEnough}, ${slowDownloadSpeed}, ${difficultToNavigate}, ${operationNotSmooth}, '${otherSuggestion}', '${email}');`,
    (err, result) => {
      if (!err) {
        res.json({
          result,
        });
      } else {
        res.json({
          message: 'error during reviewing',
        });
      }
    }
  );
};
