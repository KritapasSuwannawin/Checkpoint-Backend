const postgresql = require('../postgresql/postgresql');

exports.getResourceV1 = (req, res) => {
  const ambientPromise = new Promise((resolve, reject) => {
    postgresql.query('SELECT * FROM ambient ORDER BY id;', (err, result) => {
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
            thumbnailFilePath: ambient.thumbnail_file_path,
            volume: Number(ambient.volume),
          };
        })
      );
    });
  });

  const backgroundPromise = new Promise((resolve, reject) => {
    postgresql.query('SELECT * FROM background ORDER BY id;', (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(
        result.rows.map((background) => {
          return {
            id: background.id,
            filePath: background.file_path,
            thumbnailFilePath: background.thumbnail_file_path,
            ambientIdArr: background.ambient_id_arr,
            isPremium: background.is_premium,
          };
        })
      );
    });
  });

  const musicPromise = new Promise((resolve, reject) => {
    postgresql.query(
      'SELECT m.*, mc.name AS category_name FROM music m INNER JOIN music_category mc ON m.category_id = mc.id ORDER BY m.id;',
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
              category: music.category_name,
              moodIdArr: music.mood_id_arr,
            };
          })
        );
      }
    );
  });

  const avatarPromise = new Promise((resolve, reject) => {
    postgresql.query('SELECT * FROM avatar ORDER BY id;', (err, result) => {
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

  const moodPromise = new Promise((resolve, reject) => {
    postgresql.query('SELECT * FROM music_mood ORDER BY id;', (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(
        result.rows.map((mood) => {
          return {
            id: mood.id,
            name: mood.name,
            filePath: mood.file_path,
          };
        })
      );
    });
  });

  Promise.all([ambientPromise, backgroundPromise, musicPromise, avatarPromise, moodPromise])
    .then((dataArr) => {
      res.json({
        statusCode: 2001,
        data: {
          ambient: dataArr[0],
          background: dataArr[1],
          music: dataArr[2],
          avatar: dataArr[3],
          mood: dataArr[4],
        },
      });
    })
    .catch(() => {
      res.json({
        statusCode: 4000,
      });
    });
};
