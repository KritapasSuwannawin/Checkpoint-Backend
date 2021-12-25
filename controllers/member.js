const postgresql = require('../postgresql/postgresql');

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
                        username: member.username,
                        avatarId: member.avatar_id,
                        memberType: member.is_premium ? 'premium' : 'free',
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
              const selectMemberPromise = new Promise((resolve, reject) => {
                postgresql.query(
                  `SELECT m.*, ms.background_id, ms.music_id, ms.music_category_id, ms.favourite_music_id_arr, ms.play_from_playlist, mc.name AS music_category
                FROM member m 
                INNER JOIN member_setting ms ON m.id = ms.id
                LEFT JOIN music_category mc ON ms.music_category_id = mc.id
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
