const fs = require('fs/promises')

exports.getAPI = (req, res, next) => {
    fs.readFile(`${__dirname}/../endpoints.json`,"utf8")
    .then((endpoints) => {
      res.status(200).send(JSON.parse(endpoints));
    })
    .catch(next);
};
