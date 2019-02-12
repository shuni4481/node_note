var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'tlgnsqkqh1',
  database: 'note'
});
connection.connect();
/* GET home page. */
router.get('/', function (req, res, next) {
  var sql = "SELECT b_no, b_title, user.name as name, DATE_FORMAT((b_time), '%Y-%m-%d') as b_time FROM board LEFT JOIN user on board.b_writer = user.no order by b_no desc";
  var sql = connection.query(sql, function (err, rows) {
    if (err) {
      throw err;
    }
    if (req.session.passport !== undefined) {
      if (req.session.passport.user !== undefined) {
        //로그인 한 사용자
        res.render('index', {
          title: 'MyBoard',
          session: req.session.passport,
          notes:rows
        });
      } else {
        res.render('index', {
          title: 'MyBoard',
          session: {},
          notes:rows
        });
      }
    } else {
      res.render('index', {
        title: 'MyBoard',
        session: {},
        notes:rows
      });
    }
    console.log(rows);
  });
});

module.exports = router;