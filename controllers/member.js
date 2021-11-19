const postgresql = require('../postgresql/postgresql');

exports.memberLogin = (req, res) => {
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
      const insertMemberAuthenticationPromise = new Promise((resolve, reject) => {
        postgresql.query(
          `INSERT INTO member_authentication (email, password, login_method) values ('${email}', MD5('${password}'), '${loginMethod}');`,
          (err, result) => {
            resolve(result ? result : err);
          }
        );
      });

      const insertMemberPromise = new Promise((resolve, reject) => {
        postgresql.query(
          `INSERT INTO member (username, avatar_id, is_premium) values ('${email.split('@')[0]}', 1, FALSE);`,
          (err, result) => {
            resolve(result ? result : err);
          }
        );
      });

      const insertMemberSettingPromise = new Promise((resolve, reject) => {
        postgresql.query(
          "INSERT INTO member_setting (background_id, music_id, music_category_id) values ('0111', 1, NULL);",
          (err, result) => {
            resolve(result ? result : err);
          }
        );
      });

      Promise.all([insertMemberAuthenticationPromise, insertMemberPromise, insertMemberSettingPromise]).then(() => {
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
                        username: member.username,
                        avatarId: member.avatar_id,
                        memberType: member.is_premium ? 'premium' : 'free',
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
      postgresql.query(`SELECT MD5('${password}')`, (err, result) => {
        if (result) {
          const encryptedPassword = result.rows[0].md5;
          if (encryptedPassword !== data[0].password) {
            res.json({
              message: 'invalid password',
            });
          } else {
            const selectMemberPromise = new Promise((resolve, reject) => {
              postgresql.query(
                `SELECT m.*, ms.background_id, ms.music_id, ms.music_category_id, mc.name AS music_category
                FROM member m 
                INNER JOIN member_setting ms ON m.id = ms.id
                LEFT JOIN music_category mc ON ms.music_category_id = mc.id
                WHERE m.id = (SELECT id FROM member_authentication WHERE email = '${email}' AND password = '${encryptedPassword}' AND login_method = '${loginMethod}');`,
                (err, result) => {
                  resolve(
                    result
                      ? result.rows.map((member) => {
                          return {
                            id: member.id,
                            username: member.username,
                            avatarId: member.avatar_id,
                            memberType: member.is_premium ? 'premium' : 'free',
                            backgroundId: member.background_id,
                            musicId: member.music_id,
                            musicCategoryId: member.music_category_id,
                            musicCategory: member.music_category,
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
      });
    } else {
      res.json({
        message: 'error during authentication',
      });
    }
  });
};

exports.memberUpgrade = (req, res) => {
  const memberId = req.body.memberId;

  postgresql.query(`UPDATE member SET is_premium = TRUE WHERE id = ${memberId};`, (err, result) => {
    if (!err) {
      res.json({
        result,
      });
    } else {
      res.json({
        message: 'error during upgrading to premium',
      });
    }
  });
};

exports.memberSetting = (req, res) => {
  const backgroundId = req.body.backgroundId;
  const musicId = req.body.musicId;
  const musicCategory = req.body.musicCategory;
  const memberId = req.body.memberId;

  postgresql.query(
    `UPDATE member_setting SET background_id = '${backgroundId}', music_id = ${musicId}, music_category_id = (SELECT id FROM music_category WHERE name = '${musicCategory}') WHERE id = ${memberId};`,
    (err, result) => {
      res.json({});
    }
  );
};
