const postgresql = require('../postgresql/postgresql');

exports.getResource = (req, res) => {
  const ambientPromise = new Promise((resolve, reject) => {
    postgresql.query('SELECT * FROM ambient ORDER BY id;', (err, result) => {
      resolve(
        result
          ? result.rows.map((ambient) => {
              return {
                id: ambient.id,
                name: ambient.name,
                filePath: ambient.file_path,
                thumbnailFilePath: ambient.thumbnail_file_path,
                volume: Number(ambient.volume),
              };
            })
          : err
      );
    });
  });

  const backgroundPromise = new Promise((resolve, reject) => {
    postgresql.query('SELECT * FROM background ORDER BY id;', (err, result) => {
      resolve(
        result
          ? result.rows.map((background) => {
              return {
                id: background.id,
                filePath: background.file_path,
                thumbnailFilePath: background.thumbnail_file_path,
                ambientIdArr: background.ambient_id_arr,
              };
            })
          : err
      );
    });
  });

  const musicPromise = new Promise((resolve, reject) => {
    postgresql.query(
      'SELECT m.*, mc.name AS category_name FROM music m INNER JOIN music_category mc ON m.category_id = mc.id ORDER BY m.id;',
      (err, result) => {
        resolve(
          result
            ? result.rows.map((music) => {
                return {
                  id: music.id,
                  musicName: music.music_name,
                  artistName: music.artist_name,
                  filePath: music.file_path,
                  thumbnailFilePath: music.thumbnail_file_path,
                  category: music.category_name,
                };
              })
            : err
        );
      }
    );
  });

  Promise.all([ambientPromise, backgroundPromise, musicPromise]).then((values) => {
    res.json({
      data: {
        ambient: values[0],
        background: values[1],
        music: values[2],
      },
    });
  });
};
