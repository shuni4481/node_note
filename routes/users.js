var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var crypto = require('crypto');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// DATABASE SETTING
var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'tlgnsqkqh1',
  database: 'note'
});
connection.connect();
passport.serializeUser(function (user, done) {
  done(null, user);
});

/*인증 후, 페이지 접근시 마다 사용자 정보를 Session에서 읽어옴.*/
passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'password',
  session: true,
  passReqToCallback: true
}, function (req, id, password, done) {
  connection.query('select * from `user` where `id` = ?', id, function (err, result) {
    if (err) {
      console.log('err :' + err);
      return done(false, null);
    } else {
      if (result.length === 0) {
        console.log('해당 유저가 없습니다');
        return done(false, null);
      } else {
        var hashpass = crypto.createHash("sha512").update(password).digest("hex");
        if (hashpass != result[0].password) {
          console.log('패스워드가 일치하지 않습니다');
          return done(false, null);
        } else {
          console.log('로그인 성공');
          return done(null, {
            id: result[0].id,
            name: result[0].name,
            no: result[0].no
          });
        }
      }
    }
  })
}));

/* GET users listing. */
router.get('/', function (req, res) {
  var sql = "select * from user;";
  var query = connection.query(sql, function (err, rows) {
    if (err) {
      throw err;
    }
    if (req.session.passport !== undefined) {
      if (req.session.passport.user !== undefined) {
        //로그인 한 사용자
        res.render('users', {
          title: 'MyBoard',
          session: req.session.passport,
          users: rows
        });
      } else {
        res.redirect('/');
      }
    } else {
      res.redirect('/');
    }
  });
});

router.get('/login', function (req, res, next) {
  if (req.session.passport !== undefined) {
    if (req.session.passport.user !== undefined) {
      //로그인 한 사용자
      res.redirect('/');
    } else {
      res.render('login', {
        title: 'MyBoard',
        session: {}
      });
    }
  } else {
    res.render('login', {
      title: 'MyBoard',
      session: {}
    });
  }
});

router.get('/signup', function (req, res, next) {
  if (req.session.passport !== undefined) {
    if (req.session.passport.user !== undefined) {
      //로그인 한 사용자
      res.redirect('/');
    } else {
      res.render('signup', {
        title: 'MyBoard',
        session: {}
      });
    }
  } else {
    res.render('signup', {
      title: 'MyBoard',
      session: {}
    });
  }
});

router.post('/signup', function (req, res) {
  var id = req.body.id;
  var password = req.body.password;
  var hashpass = crypto.createHash("sha512").update(password).digest("hex");
  var name = req.body.name;
  var email = req.body.email;
  var address = req.body.address;
  var sql = "insert into user (id, password, name, email, address) values('" + id + "','" + hashpass + "','" + name + "','" + email + "','" + address + "')";
  var query = connection.query(sql, function (err, rows) {
    if (err) {
      throw err;
    }
    console.log("Data inserted!");
    res.redirect('/');
  });
});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: true
  }), // 인증실패시 401 리턴, {} -> 인증 스트레티지
  function (req, res) {
    res.redirect('/');
  }
);

router.get('/logout', function (req, res) {
  if (req.session.passport !== undefined) {
    if (req.session.passport.user !== undefined) {
      //로그인 한 사용자
      req.logout();
      res.redirect('/');
    } else {
      //로그아웃 사용자
      res.redirect('/');
    }
  } else {
    res.redirect('/');
  }
})
module.exports = router;