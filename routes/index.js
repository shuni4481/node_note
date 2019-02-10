var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log(req.session.passport)
  if(req.session.passport !== undefined) {
    if(req.session.passport.user !== undefined) {
      //로그인 한 사용자
      res.render('index', {
        title: 'MyBoard',
        session: req.session.passport
      });
    } else {
      res.render('note_list', {
        title: 'MyBoard',
        session:{}
      });
    } 
  } else {
    res.render('note_list', {
      title: 'MyBoard',
      session:{}
    });
  }
  
});

module.exports = router;