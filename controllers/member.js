const postgres = require('../postgres/postgres');
const aws = require('aws-sdk');
const crypto = require('crypto-js');

const SESConfig = {
  apiVersion: '2010-12-01',
  accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  region: process.env.AWS_SES_REGION,
};

function sendMail(to, type, verificationCode) {
  let subject = '';
  let html = '';

  if (type === 'memberVerification') {
    subject = "Checkpoint's Verification Code";
    html = `<h3 style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-weight: bold; font-size: 24px; line-height: 36px; margin: 16px 0px; color: rgb(30, 32, 38);">Please Confirm Your Registration</h3>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">Welcome to Checkpoint!<br>Here is your account activation code:</p>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br><span style="padding: 5px 0px; font-size: 20px; font-weight: bolder; color: rgb(245, 122, 232);">${verificationCode}</span></p>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);"><br></p>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">For further assistance, please contact us at support@checkpoint.tokyo<br>This is an automated message, please do not reply.</p>`;
  } else if (type === 'memberForgetPassword') {
    subject = "Checkpoint's Reset Password Verification Code";
    html = `<h3 style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-weight: bold; font-size: 24px; line-height: 36px; margin: 16px 0px; color: rgb(30, 32, 38);">Reset Your Password</h3>

    <p style="font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; margin: 16px 0px 0px; color: rgb(71, 77, 87);">Here is your verification code:</p>

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
  let { email, is_mobile: isMobile } = req.query;
  isMobile = isMobile === 'true';

  if (!email) {
    res.json({
      statusCode: 4001,
    });
    return;
  }

  const selectMemberAuthenticationPromise = new Promise((resolve, reject) => {
    postgres.query(`SELECT * FROM member_authentication WHERE email = '${email}' and login_method = 'email';`, (err, result) => {
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
        const sendMailPromise = sendMail(email, 'memberVerification', verificationCode);

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
    postgres.query(`SELECT * FROM member_authentication WHERE email = '${email}' and login_method = '${loginMethod}';`, (err, result) => {
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
          postgres.query(
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
              postgres.query(
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
    postgres.query(`SELECT * FROM member_authentication WHERE email = '${email}' and login_method = '${loginMethod}';`, (err, result) => {
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
        postgres.query(`SELECT verify_password('${password}', '${email}', '${loginMethod}') AS verification;`, (err, result) => {
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
            postgres.query(
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
  let { email, is_mobile: isMobile } = req.query;
  isMobile = isMobile === 'true';

  if (!email) {
    res.json({
      statusCode: 4000,
    });
    return;
  }

  const selectMemberAuthenticationPromise = new Promise((resolve, reject) => {
    postgres.query(`SELECT * FROM member_authentication WHERE email = '${email}' and login_method = 'email';`, (err, result) => {
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
        const sendMailPromise = sendMail(email, 'memberForgetPassword', verificationCode);

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

  postgres.query(
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

  if (Math.floor(onlineDuration / 1000) === 0) {
    postgres.query(`UPDATE member SET current_device_id = '${deviceId}' WHERE id = ${memberId};`, (err, _) => {
      if (err) {
        res.json({
          statusCode: 4000,
        });
        return;
      }

      res.json({
        statusCode: 2001,
      });
    });
  } else {
    postgres.query(`SELECT current_device_id FROM member WHERE id = ${memberId};`, (err, result) => {
      if (err) {
        res.json({
          statusCode: 4000,
        });
        return;
      }

      if (result.rows[0].current_device_id === deviceId) {
        postgres.query(
          `UPDATE member_setting SET background_id = '${backgroundId}', music_id = ${musicId}, music_category_id = (SELECT id FROM music_category WHERE name = '${musicCategory}'), favourite_music_id_arr = ARRAY[${favouriteMusicIdArr}]::integer[], play_from_playlist = ${isPlayFromPlaylist} WHERE id = ${memberId};`,
          (err, _) => {
            if (err) {
              res.json({
                statusCode: 4000,
              });
              return;
            }

            res.json({
              statusCode: 2001,
            });
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

  postgres.query(`UPDATE member SET username = '${username}', avatar_id = ${avatarId} WHERE id = ${memberId};`, (err, _) => {
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

  postgres.query(`SELECT * FROM ${tableName} WHERE id = ${memberId};`, (err, result) => {
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
    postgres.query(
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
    postgres.query(
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

  postgres.query(`INSERT INTO member_issue VALUES (${memberId}, '${email}', '${subject}', '${detail}');`, (err, result) => {
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
