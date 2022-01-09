const mysql = require('mysql');

const db = mysql.createConnection({
    host : 'localhost',
    user : 'mini',
    password : '1234',
    database : 'madcamp'
});

module.exports = db;