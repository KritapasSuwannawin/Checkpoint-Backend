const postgres = require('../postgres/postgres');

exports.getResourceV1 = (req, res) => {
  const ambientPromise = new Promise((resolve, reject) => {
    postgres.query('SELECT * FROM ambient ORDER BY id;', (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(
        result.rows.map((ambient) => {
          return {
            id: ambient.id,
            name: ambient.name,
            filePath: ambient.file_path,
            whiteIconFilePath: ambient.white_icon_file_path,
            blackIconFilePath: ambient.black_icon_file_path,
            volume: Number(ambient.volume),
          };
        })
      );
    });
  });

  const backgroundPromise = new Promise((resolve, reject) => {
    postgres.query(
      `SELECT b.*, bc.name AS category_name, bvc.viewcount::integer AS view_count FROM background b
      INNER JOIN background_category bc ON b.category_id = bc.id
      INNER JOIN "bg-viewcount" bvc ON b.id = bvc."BG_ID"
      ORDER BY b.id;`,
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(
          result.rows.map((background) => {
            return {
              id: background.id,
              name: background.name,
              artistName: background.artist_name,
              filePath: background.file_path,
              thumbnailFilePath: background.thumbnail_file_path,
              storyUrl: background.story_url,
              ambientIdArr: background.ambient_id_arr,
              isMember: background.is_member,
              categoryId: background.category_id,
              category: background.category_name,
              isTopHit: background.is_top_hit,
              viewCount: background.view_count + 590,
            };
          })
        );
      }
    );
  });

  const backgroundCategoryPromise = new Promise((resolve, reject) => {
    postgres.query('SELECT * FROM background_category ORDER BY id;', (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(
        result.rows.map((category) => {
          return {
            id: category.id,
            name: category.name,
          };
        })
      );
    });
  });

  const musicPromise = new Promise((resolve, reject) => {
    postgres.query(
      'SELECT m.*, mc.name AS category_name FROM music m LEFT JOIN music_category mc ON m.category_id = mc.id ORDER BY m.id;',
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(
          result.rows.map((music) => {
            return {
              id: music.id,
              musicName: music.music_name,
              artistName: music.artist_name,
              artistLink: music.artist_link,
              filePath: music.file_path,
              thumbnailFilePath: music.thumbnail_file_path,
              categoryId: music.category_id,
              category: music.category_name,
              isMood: music.is_mood,
            };
          })
        );
      }
    );
  });

  const musicCategoryPromise = new Promise((resolve, reject) => {
    postgres.query('SELECT * FROM music_category ORDER BY id;', (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(
        result.rows.map((category) => {
          return {
            id: category.id,
            name: category.name,
          };
        })
      );
    });
  });

  const avatarPromise = new Promise((resolve, reject) => {
    postgres.query('SELECT * FROM avatar ORDER BY id;', (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(
        result.rows.map((avatar) => {
          return {
            id: avatar.id,
            filePath: avatar.file_path,
          };
        })
      );
    });
  });

  Promise.all([ambientPromise, backgroundPromise, backgroundCategoryPromise, musicPromise, musicCategoryPromise, avatarPromise])
    .then((dataArr) => {
      res.json({
        statusCode: 2001,
        data: {
          ambient: dataArr[0],
          background: dataArr[1],
          backgroundCategory: dataArr[2],
          music: dataArr[3],
          musicCategory: dataArr[4],
          avatar: dataArr[5],
        },
      });
    })
    .catch(() => {
      res.json({
        statusCode: 4000,
      });
    });
};
