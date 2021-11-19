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
          `INSERT INTO member_authentication (email, password, login_method) values ('${email}', '${password}', '${loginMethod}');`,
          (err, result) => {
            resolve(result ? result : err);
          }
        );
      });

      const insertMemberPromise = new Promise((resolve, reject) => {
        postgresql.query(
          `INSERT INTO member (username, member_type_id, avatar_id) values ('${email.split('@')[0]}', 1, 1);`,
          (err, result) => {
            resolve(result ? result : err);
          }
        );
      });

      const insertMemberSettingPromise = new Promise((resolve, reject) => {
        postgresql.query(
          'INSERT INTO member_setting (background_id, music_id, music_category_id) values ("0111", 1, NULL);',
          (err, result) => {
            resolve(result ? result : err);
          }
        );
      });

      Promise.all([insertMemberAuthenticationPromise, insertMemberPromise, insertMemberSettingPromise]).then(() => {
        const selectMemberPromise = new Promise((resolve, reject) => {
          postgresql.query(
            `SELECT m.*, mt.name AS member_type FROM member m 
            INNER JOIN member_type mt ON m.member_type_id = mt.id
            WHERE m.id = (SELECT id FROM member_authentication WHERE email = '${email}' AND password = '${password}' AND login_method = '${loginMethod}');`,
            (err, result) => {
              resolve(
                result
                  ? result.rows.map((member) => {
                      return {
                        id: member.id,
                        username: member.username,
                        memberTypeId: member.member_type_id,
                        avatarId: member.avatar_id,
                        memberType: member.member_type,
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
      if (password !== data[0].password) {
        res.json({
          message: 'invalid password',
        });
      } else {
        const selectMemberPromise = new Promise((resolve, reject) => {
          postgresql.query(
            `SELECT m.*, mt.name AS member_type, ms.background_id, ms.music_id, ms.music_category_id, mc.name AS music_category
            FROM member m 
            INNER JOIN member_type mt ON m.member_type_id = mt.id
            INNER JOIN member_setting ms ON m.id = ms.id
            LEFT JOIN music_category mc ON ms.music_category_id = mc.id
            WHERE m.id = (SELECT id FROM member_authentication WHERE email = '${email}' AND password = '${password}' AND login_method = '${loginMethod}');`,
            (err, result) => {
              resolve(
                result
                  ? result.rows.map((member) => {
                      return {
                        id: member.id,
                        username: member.username,
                        memberTypeId: member.member_type_id,
                        avatarId: member.avatar_id,
                        memberType: member.member_type,
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
};

exports.memberUpgrade = (req, res) => {
  const memberId = req.body.memberId;

  postgresql.query(`UPDATE member SET member_type_id = 2 WHERE id = ${memberId};`, (err, result) => {
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
