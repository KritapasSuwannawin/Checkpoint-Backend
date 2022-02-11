const postgresql = require('../postgresql/postgresql');
const aws = require('aws-sdk');
const crypto = require('crypto-js');

// const Recipient = require('mailersend').Recipient;
// const EmailParams = require('mailersend').EmailParams;
// const MailerSend = require('mailersend');

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

  // const mailersend = new MailerSend({
  //   api_key: process.env.MAILERSEND_API_KEY,
  // });

  // const recipients = [new Recipient(to)];

  // const emailParams = new EmailParams()
  //   .setFrom(process.env.no_reply_email)
  //   .setFromName('Checkpoint.tokyo')
  //   .setRecipients(recipients)
  //   .setSubject(subject)
  //   .setHtml(html);

  // mailersend.send(emailParams);

  // return new Promise((resolve, reject) => resolve());
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
                        isPremium: true,
                        registrationDate: member.registration_date,
                        premiumExpirationDate: member.premium_expiration_date,
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
              const selectMemberPromise = new Promise((resolve, reject) => {
                postgresql.query(
                  `SELECT m.*, ms.background_id, ms.music_id, ms.music_category_id, ms.favourite_music_id_arr, ms.play_from_playlist, mc.name AS music_category
                  FROM member m 
                  INNER JOIN member_setting ms ON m.id = ms.id
                  LEFT JOIN music_category mc ON ms.music_category_id = mc.id
                  WHERE m.id = (SELECT id FROM member_authentication WHERE email = '${email}' AND password = MD5('${password}') AND login_method = '${loginMethod}');`,
                  (err, result) => {
                    const currentTime = new Date().getTime();
                    const premiumExpirationTime = new Date(result.rows[0].premium_expiration_date).getTime();

                    resolve(
                      result
                        ? result.rows.map((member) => {
                            return {
                              id: member.id,
                              email,
                              username: member.username,
                              avatarId: member.avatar_id,
                              isPremium: premiumExpirationTime - currentTime >= 0 ? true : false,
                              registrationDate: member.registration_date,
                              premiumExpirationDate: member.premium_expiration_date,
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

exports.memberSetting = (req, res) => {
  const backgroundId = req.body.backgroundId;
  const musicId = req.body.musicId;
  const musicCategory = req.body.musicCategory;
  const memberId = req.body.memberId;
  const favouriteMusicIdArr = req.body.favouriteMusicIdArr;
  const playFromPlaylist = req.body.playFromPlaylist;
  const deviceId = req.body.deviceId;
  const onlineDuration = req.body.onlineDuration;

  if (!memberId) {
    res.json({});
  } else {
    if (Math.floor(onlineDuration / 1000) === 0) {
      postgresql.query(`UPDATE member SET current_device_id = '${deviceId}' WHERE id = ${memberId};`, (err, result) => {
        res.json({});
      });
    } else {
      postgresql.query(`SELECT current_device_id FROM member WHERE id = ${memberId};`, (err, result) => {
        if (result) {
          if (result.rows[0].current_device_id === deviceId) {
            postgresql.query(
              `UPDATE member_setting SET background_id = '${backgroundId}', music_id = ${musicId}, music_category_id = (SELECT id FROM music_category WHERE name = '${musicCategory}'), favourite_music_id_arr = ARRAY[${favouriteMusicIdArr}], play_from_playlist = ${playFromPlaylist} WHERE id = ${memberId};`,
              (err, result) => {
                res.json({});
              }
            );
          } else {
            res.json({
              message: 'new device has logged in',
            });
          }
        } else {
          res.json({});
        }
      });
    }
  }
};

exports.memberProfile = (req, res) => {
  const memberId = req.body.memberId;
  const avatarId = req.body.avatarId;

  postgresql.query(`UPDATE member SET avatar_id = '${avatarId}' WHERE id = ${memberId};`, (err, result) => {
    res.json({});
  });
};

exports.memberCheckFeedback = (req, res) => {
  const { memberId, tableName } = req.body;

  postgresql.query(`SELECT * FROM ${tableName} WHERE id = ${memberId};`, (err, result) => {
    if (result && result.rows.length === 1) {
      res.json({
        message: 'done',
      });
    } else {
      res.json({});
    }
  });
};

exports.memberFeedback = (req, res) => {
  const { memberId, tableName } = req.body;

  if (tableName === 'feedback_five_minute') {
    const { star, ad, social_media, friend, otherWay, sleep, productivity, relax, other_interest } = req.body;
    postgresql.query(
      `INSERT INTO ${tableName} VALUES (${memberId}, ${star}, ${ad}, ${social_media}, ${friend}, '${otherWay}', ${sleep}, ${productivity}, ${relax}, '${other_interest}');`,
      (err, result) => {
        res.json({});
      }
    );
  } else if (tableName === 'feedback_after_trial_standard') {
    const {
      feature_already_enough,
      expensive,
      rarely_use,
      use_other_service,
      not_worth_money,
      not_looking_for,
      other,
      star,
    } = req.body;
    postgresql.query(
      `INSERT INTO ${tableName} VALUES (${memberId}, ${feature_already_enough}, ${expensive}, ${rarely_use}, ${use_other_service}, ${not_worth_money}, ${not_looking_for}, '${other}', ${star});`,
      (err, result) => {
        res.json({});
      }
    );
  } else if (tableName === 'feedback_trial_last_day') {
    const {
      music_quantity,
      ambience_quantity,
      background_quantity,
      music_quality,
      ambience_quality,
      background_quality,
      interface,
      other_weakness,
      ambience_customization,
      background_customization,
      easy_to_use,
      suggestion,
      star,
      wanted_feature,
      other_strength,
    } = req.body;
    postgresql.query(
      `INSERT INTO ${tableName} VALUES (${memberId}, ${music_quantity}, ${ambience_quantity}, ${background_quantity}, ${music_quality}, ${ambience_quality}, ${background_quality}, ${interface}, '${other_weakness}', ${ambience_customization}, ${background_customization}, ${easy_to_use}, '${suggestion}', ${star}, '${wanted_feature}', '${other_strength}');`,
      (err, result) => {
        res.json({});
      }
    );
  } else if (tableName === 'feedback_after_trial_premium') {
    const {
      sleep,
      productivity,
      relax,
      affordable,
      quality,
      other_reason,
      personalization,
      one_stop_service,
      other_value,
      relaxing_music,
      peaceful_art,
      realistic_ambience,
      background_customization,
      ambience_customization,
      easy_to_use,
      other_feature,
      star,
    } = req.body;
    postgresql.query(
      `INSERT INTO ${tableName} VALUES (${memberId}, ${sleep}, ${productivity}, ${relax}, ${affordable}, ${quality}, '${other_reason}', ${personalization}, ${one_stop_service}, '${other_value}', ${relaxing_music}, ${peaceful_art}, ${realistic_ambience}, ${background_customization}, ${ambience_customization}, ${easy_to_use}, '${other_feature}', ${star});`,
      (err, result) => {
        res.json({});
      }
    );
  } else if (tableName === 'feedback') {
    const {
      star,
      high_school,
      college,
      working,
      other_job,
      less_than_one_week,
      one_week,
      almost_one_month,
      more_than_one_month,
      full_screen_browser,
      minimized_browser,
      half_screen_browser,
      phone,
      sleep,
      productivity,
      relax,
      other_problem,
    } = req.body;
    postgresql.query(
      `INSERT INTO ${tableName} VALUES (${memberId}, ${star}, ${high_school}, ${college}, ${working}, '${other_job}', ${less_than_one_week}, ${one_week}, ${almost_one_month}, ${more_than_one_month}, ${full_screen_browser}, ${minimized_browser}, ${half_screen_browser}, ${phone}, ${sleep}, ${productivity}, ${relax}, '${other_problem}');`,
      (err, result) => {
        res.json({});
      }
    );
  } else {
    res.json({});
  }
};

exports.memberIssue = (req, res) => {
  const { memberId, email, subject, detail } = req.body;
  postgresql.query(
    `INSERT INTO member_issue VALUES (${memberId}, '${email}', '${subject}', '${detail}');`,
    (err, result) => {
      res.json({});
    }
  );
};

exports.memberPayment = (req, res) => {
  const { supporter_email: email, total_amount: amount } = req.body.response;

  if (Number(amount) >= Number(process.env.SUBSCRIPTION_PRICE_THREE)) {
    function makeId(length) {
      let result = '';
      const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }

    const activationCode = makeId(10);

    postgresql.query(
      `INSERT INTO coupon (email, code, is_activated, month) values ('${email}', '${activationCode}', false, 3);`,
      (err, result) => {
        const sendMailPromise = sendMail(
          email,
          "Checkpoint's Premium Activation Code",
          `<h3 style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-weight: bold; font-size: 24px; line-height: 36px; margin: 16px 0px; color: rgb(30, 32, 38);"><span class="il">Checkpoint Premium</span> Activation</h3>
          <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">Thank you for purchasing Checkpoint Premium!<br>Here is your premium activation code:</p>
          <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br><span style="padding: 5px 0px; font-size: 20px; font-weight: bolder; color: rgb(245, 122, 232);">${activationCode}</span></p>
          <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br></p>
          <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">For further assistance, please contact us at support@checkpoint.tokyo<br>This is an automated message, please do not reply.</p>`
        );

        sendMailPromise
          .then(() => {
            res.json({});
          })
          .catch(() => {
            res.json({});
          });
      }
    );
  } else if (Number(amount) >= Number(process.env.SUBSCRIPTION_PRICE_ONE)) {
    function makeId(length) {
      let result = '';
      const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }

    const activationCode = makeId(10);

    postgresql.query(
      `INSERT INTO coupon (email, code, is_activated, month) values ('${email}', '${activationCode}', false, 1);`,
      (err, result) => {
        const sendMailPromise = sendMail(
          email,
          "Checkpoint's Premium Activation Code",
          `<h3 style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-weight: bold; font-size: 24px; line-height: 36px; margin: 16px 0px; color: rgb(30, 32, 38);"><span class="il">Checkpoint Premium</span> Activation</h3>
          <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">Thank you for purchasing Checkpoint Premium!<br>Here is your premium activation code:</p>
          <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br><span style="padding: 5px 0px; font-size: 20px; font-weight: bolder; color: rgb(245, 122, 232);">${activationCode}</span></p>
          <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br></p>
          <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">For further assistance, please contact us at support@checkpoint.tokyo<br>This is an automated message, please do not reply.</p>`
        );

        sendMailPromise
          .then(() => {
            res.json({});
          })
          .catch(() => {
            res.json({});
          });
      }
    );
  } else {
    res.json({});
  }
};

exports.memberActivation = (req, res) => {
  const { memberId, activationCode } = req.body;

  postgresql.query(`SELECT is_activated, month FROM coupon WHERE code = '${activationCode}';`, (err, result) => {
    if (result) {
      if (result.rows.length === 1) {
        const { is_activated, month } = result.rows[0];
        if (is_activated) {
          res.json({
            message: 'code already used',
          });
        } else {
          postgresql.query(`UPDATE coupon SET is_activated = true WHERE code = '${activationCode}';`, (err, result) => {
            if (err) {
              res.json({
                message: 'error during authentication',
              });
            } else {
              postgresql.query(`CALL activate_member(${memberId}, ${month});`, (err, result) => {
                if (err) {
                  res.json({
                    message: 'error during authentication',
                  });
                } else {
                  res.json({
                    month,
                  });
                }
              });
            }
          });
        }
      } else {
        res.json({
          message: 'invalid code',
        });
      }
    } else {
      res.json({
        message: 'error during authentication',
      });
    }
  });
};
