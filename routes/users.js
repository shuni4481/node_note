var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var crypto = require('crypto');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;
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
});

// 카카오톡 로그인
passport.use('kakao-login', new KakaoStrategy({
    clientID: '3fa756316ec03e1c0700a0f5d5258414',
    clientSecret: 'WkUs2NC4xM9EY5IAGeFxb7I2HRHO8jo7',
    callbackURL: 'http://localhost:3000/users/oauth/kakao/callback'
  },
  function (accessToken, refreshToken, profile, done) {
    console.log('Kakao login info');
    console.log(profile);
    // todo 유저 정보와 done을 공통 함수에 던지고 해당 함수에서 공통으로 회원가입 절차를 진행할 수 있도록 한다.
    var sqlForSelectList = "SELECT * FROM user WHERE no = ?"
    connection.query(sqlForSelectList, profile.id, function (err, result) {
      if (err) {
        return done(err);
      } else {
        if (result.length == 0) {
          // 신규 유저일시
          console.log("new kakao user");
          var no = profile.id;
          var id = "kakao"
          var password = "kakao";
          var name = profile.username;
          var email = "kakao";
          var address = "kakao";
          var datas = [no, id, password, name, email, address];

          var sqlForSelectList = "INSERT INTO user (no, id, password, name, email, address) values (?, ?, ?, ?, ?, ?)";
          connection.query(sqlForSelectList, datas, function (err, result) {
            if (err) console.log("err : " + err);
            else {
              console.log("rows : " + JSON.stringify(result));
              return done(null, {
                id: "kakao",
                name: profile.username,
                no: profile.id
              });
            }
          })
        } else {
          // 기존 유저 일시
          console.log("exist kakao user");
          return done(null, {
            id: result[0].id,
            name: result[0].name,
            no: result[0].no
          });
        }
      }
    });
  }
));
router.get('/kakao',
  passport.authenticate('kakao-login')
);

// kakao 로그인 연동 콜백
router.get('/oauth/kakao/callback',
  passport.authenticate('kakao-login', {
    successRedirect: '/',
    failureRedirect: '/users/login'
  })
);
module.exports = router;