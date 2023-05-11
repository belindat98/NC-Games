const db = require("../db/connection");
const format = require('pg-format');

exports.checkExists = (table, column, value) => {
    const queryStr = format('SELECT * FROM %I WHERE %I = $1', table, column);
    const resource = table.slice(0, -1)
        return db.query(queryStr, [value]).then(({rows}) => {
            if (rows.length === 0) {
                return Promise.reject({status:404, msg: `${resource} not found`})
            }
        })
}