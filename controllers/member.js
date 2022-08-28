const postgresql = require('../postgresql/postgresql');
const aws = require('aws-sdk');
const crypto = require('crypto-js');

const SESConfig = {
  apiVersion: '2010-12-01',
  accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  region: process.env.AWS_SES_REGION,
};

function sendMail(to, type, verificationCode, isJapanese = false) {
  let subject = '';
  let html = '';

  if (type === 'memberVerification') {
    subject = "Checkpoint's Verification Code";
    html = `<h3 style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-weight: bold; font-size: 24px; line-height: 36px; margin: 16px 0px; color: rgb(30, 32, 38);">${
      !isJapanese ? 'Please Confirm Your Registration' : '登録をご確認ください'
    }</h3>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">${
      !isJapanese ? 'Welcome to Checkpoint!' : 'Checkpoint.tokyo へようこそ!'
    }<br>${!isJapanese ? 'Here is your account activation code:' : 'これがあなたのアカウント有効化コードです ：'}</p>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br><span style="padding: 5px 0px; font-size: 20px; font-weight: bolder; color: rgb(245, 122, 232);">${verificationCode}</span></p>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br></p>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">${
      !isJapanese
        ? 'For further assistance, please contact us at support@checkpoint.tokyo'
        : 'さらに詳しい情報は、support@checkpoint.tokyo までお問い合わせください。'
    }<br>${
      !isJapanese ? 'This is an automated message, please do not reply.' : 'これは自動メッセージです。ご返信いただいても回答できません。'
    }</p>`;
  } else if (type === 'memberForgetPassword') {
    subject = "Checkpoint's Reset Password Verification Code";
    html = `<h3 style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-weight: bold; font-size: 24px; line-height: 36px; margin: 16px 0px; color: rgb(30, 32, 38);">${
      !isJapanese ? 'Reset Your Password' : 'パスワード再設定'
    }</h3>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">${
      !isJapanese ? 'Here is your verification code:' : '認証コードはこちらです：'
    }</p>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br><span style="padding: 5px 0px; font-size: 20px; font-weight: bolder; color: rgb(245, 122, 232);">${verificationCode}</span></p>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br></p>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">${
      !isJapanese
        ? 'For further assistance, please contact us at support@checkpoint.tokyo'
        : 'さらに詳しい情報は、support@checkpoint.tokyo までお問い合わせください。'
    }<br>${
      !isJapanese ? 'This is an automated message, please do not reply.' : 'これは自動メッセージです。ご返信いただいても回答できません。'
    }</p>`;
  } else if (type === 'memberPayment') {
    subject = "Checkpoint's Premium Activation Code";
    html = `<h3 style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-weight: bold; font-size: 24px; line-height: 36px; margin: 16px 0px; color: rgb(30, 32, 38);">Checkpoint Premium Activation</h3>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">Thank you for purchasing Checkpoint Premium!<br>Here is your premium activation code:</p>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br><span style="padding: 5px 0px; font-size: 20px; font-weight: bolder; color: rgb(245, 122, 232);">${verificationCode}</span></p>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br></p>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">For further assistance, please contact us at support@checkpoint.tokyo<br>This is an automated message, please do not reply.</p>`;
  }

  if (!subject || !html) {
    return new Promise((_, reject) => {
      reject();
    });
  }

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

function makeRandomCode(length, isIncludeCharacter) {
  let result = '';
  const characters = isIncludeCharacter ? '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' : '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

exports.getEmailVerificationCodeV1 = (req, res) => {
  let { email, is_japanese: isJapanese, is_mobile: isMobile } = req.query;
  isJapanese = isJapanese === 'true';
  isMobile = isMobile === 'true';

  if (!email) {
    res.json({
      statusCode: 4001,
    });
    return;
  }

  const selectMemberAuthenticationPromise = new Promise((resolve, reject) => {
    postgresql.query(`SELECT * FROM member_authentication WHERE email = '${email}' and login_method = 'email';`, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(
        result.rows.map((memberAuthentication) => {
          return {
            id: memberAuthentication.id,
            email: memberAuthentication.email,
            password: memberAuthentication.password,
            loginMethod: memberAuthentication.login_method,
          };
        })
      );
    });
  });

  selectMemberAuthenticationPromise
    .then((data) => {
      if (data.length === 0) {
        const verificationCode = makeRandomCode(6, false);
        const sendMailPromise = sendMail(email, 'memberVerification', verificationCode, isJapanese);

        sendMailPromise
          .then(() => {
            res.json({
              statusCode: 2001,
              data: {
                verificationCode: !isMobile
                  ? crypto.AES.encrypt(verificationCode, process.env.checkpoint_security_key).toString()
                  : verificationCode,
              },
            });
          })
          .catch(() => {
            res.json({
              statusCode: 4000,
            });
          });
      } else if (data.length === 1) {
        res.json({
          statusCode: 3000,
        });
      } else {
        res.json({
          statusCode: 4000,
        });
      }
    })
    .catch(() => {
      res.json({
        statusCode: 4000,
      });
    });
};

exports.signUpMemberV1 = (req, res) => {
  const { email, password, loginMethod, isReceiveNews } = req.body;

  if (!email || !password || !loginMethod || !isReceiveNews) {
    res.json({
      statusCode: 4001,
    });
    return;
  }

  const selectMemberAuthenticationPromise = new Promise((resolve, reject) => {
    postgresql.query(`SELECT * FROM member_authentication WHERE email = '${email}' and login_method = '${loginMethod}';`, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(
        result.rows.map((memberAuthentication) => {
          return {
            id: memberAuthentication.id,
            email: memberAuthentication.email,
            password: memberAuthentication.password,
            loginMethod: memberAuthentication.login_method,
          };
        })
      );
    });
  });

  selectMemberAuthenticationPromise
    .then((data) => {
      if (data.length === 0) {
        const addNewMemberPromise = new Promise((resolve, reject) => {
          postgresql.query(
            `CALL add_new_member('${email}', '${password}', '${loginMethod}', '${email.split('@')[0]}', ${isReceiveNews});`,
            (err, result) => {
              if (err) {
                reject(err);
                return;
              }

              resolve(result);
            }
          );
        });

        addNewMemberPromise
          .then(() => {
            const selectMemberPromise = new Promise((resolve, reject) => {
              postgresql.query(
                `SELECT * FROM member m WHERE m.id = (SELECT id FROM member_authentication WHERE email = '${email}' AND password = MD5('${password}') AND login_method = '${loginMethod}');`,
                (err, result) => {
                  if (err) {
                    reject(err);
                    return;
                  }

                  resolve(
                    result.rows.map((member) => {
                      return {
                        id: member.id,
                        email,
                        username: member.username,
                        avatarId: member.avatar_id,
                        registrationDate: member.registration_date,
                        premiumExpirationDate: member.premium_expiration_date,
                        trialStartDate: member.trial_start_date,
                      };
                    })
                  );
                }
              );
            });

            selectMemberPromise
              .then((data) => {
                res.json({
                  statusCode: 2001,
                  data: {
                    memberData: data[0],
                  },
                });
              })
              .catch(() => {
                res.json({
                  statusCode: 4000,
                });
              });
          })
          .catch(() => {
            res.json({
              statusCode: 4000,
            });
          });
      } else if (data.length === 1) {
        res.json({
          statusCode: 3000,
        });
      } else {
        res.json({
          statusCode: 4000,
        });
      }
    })
    .catch(() => {
      res.json({
        statusCode: 4000,
      });
    });
};

exports.signInMemberV1 = (req, res) => {
  const { email, password, loginMethod } = req.body;

  if (!email || !password || !loginMethod) {
    res.json({
      statusCode: 4001,
    });
    return;
  }

  const selectMemberAuthenticationPromise = new Promise((resolve, reject) => {
    postgresql.query(`SELECT * FROM member_authentication WHERE email = '${email}' and login_method = '${loginMethod}';`, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(
        result.rows.map((memberAuthentication) => {
          return {
            id: memberAuthentication.id,
            email: memberAuthentication.email,
            password: memberAuthentication.password,
            loginMethod: memberAuthentication.login_method,
          };
        })
      );
    });
  });

  selectMemberAuthenticationPromise
    .then((data) => {
      if (data.length === 0) {
        res.json({
          statusCode: 3001,
        });
      } else if (data.length === 1) {
        postgresql.query(`SELECT verify_password('${password}', '${email}', '${loginMethod}') AS verification;`, (err, result) => {
          if (err) {
            res.json({
              statusCode: 4000,
            });
            return;
          }

          if (!result.rows[0].verification) {
            res.json({
              statusCode: 3002,
            });
            return;
          }

          const selectMemberPromise = new Promise((resolve, reject) => {
            postgresql.query(
              `SELECT m.*, ms.background_id, ms.music_id, ms.music_category_id, ms.favourite_music_id_arr, ms.play_from_playlist, mc.name AS music_category
                FROM member m 
                INNER JOIN member_setting ms ON m.id = ms.id
                LEFT JOIN music_category mc ON ms.music_category_id = mc.id
                WHERE m.id = (SELECT id FROM member_authentication WHERE email = '${email}' AND password = MD5('${password}') AND login_method = '${loginMethod}');`,
              (err, result) => {
                if (err) {
                  reject(err);
                  return;
                }

                resolve(
                  result.rows.map((member) => {
                    return {
                      id: member.id,
                      email,
                      username: member.username,
                      avatarId: member.avatar_id,
                      registrationDate: member.registration_date,
                      premiumExpirationDate: member.premium_expiration_date,
                      trialStartDate: member.trial_start_date,
                      backgroundId: member.background_id,
                      musicId: member.music_id,
                      musicCategoryId: member.music_category_id,
                      musicCategory: member.music_category,
                      favouriteMusicIdArr: member.favourite_music_id_arr,
                      playFromPlaylist: member.play_from_playlist,
                    };
                  })
                );
              }
            );
          });

          selectMemberPromise
            .then((data) => {
              res.json({
                statusCode: 2001,
                data: {
                  memberData: data[0],
                },
              });
            })
            .catch(() => {
              res.json({
                statusCode: 4000,
              });
            });
        });
      } else {
        res.json({
          statusCode: 4000,
        });
      }
    })
    .catch(() => {
      res.json({
        statusCode: 4000,
      });
    });
};

exports.getForgetPasswordVerificationCodeV1 = (req, res) => {
  let { email, is_japanses: isJapanese, is_mobile: isMobile } = req.query;
  isJapanese = isJapanese === 'true';
  isMobile = isMobile === 'true';

  if (!email) {
    res.json({
      statusCode: 4000,
    });
    return;
  }

  const selectMemberAuthenticationPromise = new Promise((resolve, reject) => {
    postgresql.query(`SELECT * FROM member_authentication WHERE email = '${email}' and login_method = 'email';`, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(
        result.rows.map((memberAuthentication) => {
          return {
            id: memberAuthentication.id,
            email: memberAuthentication.email,
            password: memberAuthentication.password,
            loginMethod: memberAuthentication.login_method,
          };
        })
      );
    });
  });

  selectMemberAuthenticationPromise
    .then((data) => {
      if (data.length === 0) {
        res.json({
          statusCode: 3001,
        });
      } else if (data.length === 1) {
        const verificationCode = makeRandomCode(6, false);
        const sendMailPromise = sendMail(email, 'memberForgetPassword', verificationCode, isJapanese);

        sendMailPromise
          .then(() => {
            res.json({
              statusCode: 2001,
              data: {
                verificationCode: !isMobile
                  ? crypto.AES.encrypt(verificationCode, process.env.checkpoint_security_key).toString()
                  : verificationCode,
              },
            });
          })
          .catch(() => {
            res.json({
              statusCode: 4000,
            });
          });
      } else {
        res.json({
          statusCode: 4000,
        });
      }
    })
    .catch(() => {
      res.json({
        statusCode: 4000,
      });
    });
};

exports.resetPasswordV1 = (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    res.json({
      statusCode: 4001,
    });
    return;
  }

  postgresql.query(
    `UPDATE member_authentication SET password = md5('${newPassword}') WHERE email = '${email}' and login_method = 'email';`,
    (err, _) => {
      if (err) {
        res.json({
          statusCode: 4000,
        });
        return;
      }

      res.json({
        statusCode: 2000,
      });
    }
  );
};

exports.updateSettingV1 = (req, res) => {
  const { backgroundId, musicId, musicCategory, memberId, favouriteMusicIdArr, isPlayFromPlaylist, deviceId, onlineDuration } = req.body;

  if (
    !backgroundId ||
    !musicId ||
    musicCategory === undefined ||
    !memberId ||
    !favouriteMusicIdArr ||
    isPlayFromPlaylist === undefined ||
    !deviceId ||
    !onlineDuration
  ) {
    res.json({
      statusCode: 4001,
    });
    return;
  }

  function returnIsPremium(memberId) {
    postgresql.query(`SELECT premium_expiration_date FROM member WHERE id = ${memberId};`, (err, result) => {
      if (err) {
        res.json({
          statusCode: 4000,
        });
        return;
      }

      const premiumExpirationDate = result.rows[0].premium_expiration_date;
      const currentTime = new Date().getTime();
      const premiumExpirationTime = new Date(premiumExpirationDate).getTime();

      res.json({
        statusCode: 2001,
        data: {
          isPremium: premiumExpirationTime - currentTime >= 0 ? true : false,
          premiumExpirationDate,
        },
      });
    });
  }

  if (Math.floor(onlineDuration / 1000) === 0) {
    postgresql.query(`UPDATE member SET current_device_id = '${deviceId}' WHERE id = ${memberId};`, (err, _) => {
      if (err) {
        res.json({
          statusCode: 4000,
        });
        return;
      }

      returnIsPremium(memberId);
    });
  } else {
    postgresql.query(`SELECT current_device_id FROM member WHERE id = ${memberId};`, (err, result) => {
      if (err) {
        res.json({
          statusCode: 4000,
        });
        return;
      }

      if (result.rows[0].current_device_id === deviceId) {
        postgresql.query(
          `UPDATE member_setting SET background_id = '${backgroundId}', music_id = ${musicId}, music_category_id = (SELECT id FROM music_category WHERE name = '${musicCategory}'), favourite_music_id_arr = ARRAY[${favouriteMusicIdArr}]::integer[], play_from_playlist = ${isPlayFromPlaylist} WHERE id = ${memberId};`,
          (err, _) => {
            if (err) {
              res.json({
                statusCode: 4000,
              });
              return;
            }

            returnIsPremium(memberId);
          }
        );
      } else {
        res.json({
          statusCode: 3003,
        });
      }
    });
  }
};

exports.updateProfileV1 = (req, res) => {
  const { memberId, avatarId, username } = req.body;

  if (!memberId || !avatarId || !username) {
    res.json({
      statusCode: 4001,
    });
    return;
  }

  postgresql.query(`UPDATE member SET username = '${username}', avatar_id = ${avatarId} WHERE id = ${memberId};`, (err, _) => {
    if (err) {
      res.json({
        statusCode: 4000,
      });
      return;
    }

    res.json({
      statusCode: 2000,
    });
  });
};

exports.getFeedbackStatusV1 = (req, res) => {
  const { member_id: memberId, table_name: tableName } = req.query;

  if (!memberId || !tableName) {
    res.json({
      statusCode: 4001,
    });
    return;
  }

  postgresql.query(`SELECT * FROM ${tableName} WHERE id = ${memberId};`, (err, result) => {
    if (err) {
      res.json({
        statusCode: 4000,
      });
      return;
    }

    res.json({
      statusCode: 2001,
      data: {
        feedbackStatus: result.rows.length >= 1 ? 'done' : 'not done',
      },
    });
  });
};

exports.recordFeedbackV1 = (req, res) => {
  const { memberId, tableName } = req.body;

  if (!memberId || !tableName) {
    res.json({
      statusCode: 4001,
    });
    return;
  }

  if (tableName === 'feedback_five_minute') {
    const { star, ad, social_media, friend, otherWay, sleep, productivity, relax, other_interest } = req.body;
    postgresql.query(
      `INSERT INTO ${tableName} VALUES (${memberId}, ${star}, ${ad}, ${social_media}, ${friend}, '${otherWay}', ${sleep}, ${productivity}, ${relax}, '${other_interest}');`,
      (err, _) => {
        if (err) {
          res.json({
            statusCode: 4000,
          });
          return;
        }

        res.json({
          statusCode: 2000,
        });
      }
    );
  } else if (tableName === 'feedback_after_trial_standard') {
    const { feature_already_enough, expensive, rarely_use, use_other_service, not_worth_money, not_looking_for, other, star } = req.body;
    postgresql.query(
      `INSERT INTO ${tableName} VALUES (${memberId}, ${feature_already_enough}, ${expensive}, ${rarely_use}, ${use_other_service}, ${not_worth_money}, ${not_looking_for}, '${other}', ${star});`,
      (err, _) => {
        if (err) {
          res.json({
            statusCode: 4000,
          });
          return;
        }

        res.json({
          statusCode: 2000,
        });
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
      (err, _) => {
        if (err) {
          res.json({
            statusCode: 4000,
          });
          return;
        }

        res.json({
          statusCode: 2000,
        });
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
      (err, _) => {
        if (err) {
          res.json({
            statusCode: 4000,
          });
          return;
        }

        res.json({
          statusCode: 2000,
        });
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
      (err, _) => {
        if (err) {
          res.json({
            statusCode: 4000,
          });
          return;
        }

        res.json({
          statusCode: 2000,
        });
      }
    );
  } else {
    res.json({
      statusCode: 4001,
    });
  }
};

exports.recordIssueV1 = (req, res) => {
  const { memberId, email, subject, detail } = req.body;

  if (!memberId || !email || !subject || !detail) {
    res.json({
      statusCode: 4001,
    });
  }

  postgresql.query(`INSERT INTO member_issue VALUES (${memberId}, '${email}', '${subject}', '${detail}');`, (err, result) => {
    if (err) {
      res.json({
        statusCode: 4000,
      });
      return;
    }

    res.json({
      statusCode: 2000,
    });
  });
};

exports.handlePaymentBuyMeCoffeeV1 = (req, res) => {
  const { supporter_email: email, total_amount: amount } = req.body.response;

  if (Number(amount) >= Number(process.env.SUBSCRIPTION_PRICE_THREE)) {
    const activationCode = makeRandomCode(10, true);

    postgresql.query(
      `INSERT INTO coupon (email, code, is_activated, month) values ('${email}', '${activationCode}', false, 3);`,
      (err, _) => {
        if (err) {
          aws.SES(SESConfig).sendEmail({
            Destination: {
              ToAddresses: ['checkpoint.pma@gmail.com, kritapas.ms@gmail.com'],
            },
            Message: {
              Body: {
                Html: {
                  Charset: 'UTF-8',
                  Data: `<p>User's email: ${email}</p>
                  <p>Coupon code: ${activationCode}</p>
                  <p>month: 3</p>`,
                },
              },
              Subject: {
                Charset: 'UTF-8',
                Data: 'Checkpoint Database: Unable to insert code into coupon table',
              },
            },
            Source: process.env.no_reply_email,
          });
        }

        const sendMailPromise = sendMail(email, 'memberPayment', activationCode);

        sendMailPromise
          .catch(() => {
            aws.SES(SESConfig).sendEmail({
              Destination: {
                ToAddresses: ['checkpoint.pma@gmail.com, kritapas.ms@gmail.com'],
              },
              Message: {
                Body: {
                  Html: {
                    Charset: 'UTF-8',
                    Data: `<p>User's email: ${email}</p>
                    <p>Coupon code: ${activationCode}</p>`,
                  },
                },
                Subject: {
                  Charset: 'UTF-8',
                  Data: 'Checkpoint SES: Unable to send coupon code email',
                },
              },
              Source: process.env.no_reply_email,
            });
          })
          .finally(() => res.end());
      }
    );
  } else if (Number(amount) >= Number(process.env.SUBSCRIPTION_PRICE_ONE)) {
    const activationCode = makeRandomCode(10, true);

    postgresql.query(
      `INSERT INTO coupon (email, code, is_activated, month) values ('${email}', '${activationCode}', false, 1);`,
      (err, _) => {
        if (err) {
          aws.SES(SESConfig).sendEmail({
            Destination: {
              ToAddresses: ['checkpoint.pma@gmail.com, kritapas.ms@gmail.com'],
            },
            Message: {
              Body: {
                Html: {
                  Charset: 'UTF-8',
                  Data: `<p>User's email: ${email}</p>
                  <p>Coupon code: ${activationCode}</p>
                  <p>month: 1</p>`,
                },
              },
              Subject: {
                Charset: 'UTF-8',
                Data: 'Checkpoint Database: Unable to insert code into coupon table',
              },
            },
            Source: process.env.no_reply_email,
          });
        }

        const sendMailPromise = sendMail(email, 'memberPayment', activationCode);

        sendMailPromise
          .catch(() => {
            aws.SES(SESConfig).sendEmail({
              Destination: {
                ToAddresses: ['checkpoint.pma@gmail.com, kritapas.ms@gmail.com'],
              },
              Message: {
                Body: {
                  Html: {
                    Charset: 'UTF-8',
                    Data: `<p>User's email: ${email}</p>
                  <p>Coupon code: ${activationCode}</p>`,
                  },
                },
                Subject: {
                  Charset: 'UTF-8',
                  Data: 'Checkpoint SES: Unable to send coupon code email',
                },
              },
              Source: process.env.no_reply_email,
            });
          })
          .finally(() => res.end());
      }
    );
  } else {
    aws.SES(SESConfig).sendEmail({
      Destination: {
        ToAddresses: ['checkpoint.pma@gmail.com, kritapas.ms@gmail.com'],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `<p>User's email: ${email}</p>
            <p>Payment amount: $${amount}</p>`,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Checkpoint Backend: Unable to process payment',
        },
      },
      Source: process.env.no_reply_email,
    });

    res.end();
  }
};

exports.activateAccountV1 = (req, res) => {
  const { memberId, activationCode } = req.body;

  if (!memberId || !activationCode) {
    res.json({
      statusCode: 4001,
    });
    return;
  }

  function activateMember(memberId, month) {
    postgresql.query(`CALL activate_member(${memberId}, ${month});`, (err, result) => {
      if (err) {
        res.json({
          statusCode: 4000,
        });
      } else {
        postgresql.query(`SELECT premium_expiration_date FROM member WHERE id = ${memberId};`, (err, result) => {
          if (err) {
            res.json({
              statusCode: 4000,
            });
          } else {
            res.json({
              statusCode: 2001,
              data: {
                month,
                premiumExpirationDate: result.rows[0].premium_expiration_date,
              },
            });
          }
        });
      }
    });
  }

  if (activationCode.length > 10) {
    postgresql.query(`SELECT month, member_id_arr FROM coupon_special WHERE code = '${activationCode}';`, (err, result) => {
      if (err) {
        res.json({
          statusCode: 4000,
        });
        return;
      }

      if (result.rows.length === 1) {
        const { month, member_id_arr } = result.rows[0];
        if (member_id_arr.includes(memberId)) {
          res.json({
            statusCode: 3004,
          });
        } else {
          member_id_arr.push(memberId);
          postgresql.query(
            `UPDATE coupon_special SET member_id_arr = ARRAY[${member_id_arr}]::integer[] WHERE code = '${activationCode}';`,
            (err, _) => {
              if (err) {
                res.json({
                  statusCode: 4000,
                });
                return;
              }

              activateMember(memberId, month);
            }
          );
        }
      } else {
        res.json({
          statusCode: 3005,
        });
      }
    });
  } else {
    postgresql.query(`SELECT is_activated, month FROM coupon WHERE code = '${activationCode}';`, (err, result) => {
      if (err) {
        res.json({
          statusCode: 4000,
        });
        return;
      }

      if (result.rows.length === 1) {
        const { is_activated, month } = result.rows[0];
        if (is_activated) {
          res.json({
            statusCode: 3004,
          });
        } else {
          postgresql.query(`UPDATE coupon SET is_activated = true WHERE code = '${activationCode}';`, (err, _) => {
            if (err) {
              res.json({
                statusCode: 4000,
              });
              return;
            }

            activateMember(memberId, month);
          });
        }
      } else {
        res.json({
          statusCode: 3005,
        });
      }
    });
  }
};

exports.startFreeTrialV1 = (req, res) => {
  const { memberId } = req.body;

  if (!memberId) {
    res.json({
      statusCode: 4001,
    });
    return;
  }

  postgresql.query(
    `UPDATE member SET trial_start_date = current_date, premium_expiration_date = current_date + interval '7 day' WHERE id = ${memberId};`,
    (err, _) => {
      if (err) {
        res.json({
          statusCode: 4000,
        });
        return;
      }

      postgresql.query(`SELECT trial_start_date, premium_expiration_date FROM member WHERE id = ${memberId};`, (err, result) => {
        if (err) {
          res.json({
            statusCode: 4000,
          });
          return;
        }

        res.json({
          statusCode: 2001,
          data: {
            trialStartDate: result.rows[0].trial_start_date,
            premiumExpirationDate: result.rows[0].premium_expiration_date,
          },
        });
      });
    }
  );
};
