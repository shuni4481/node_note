var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    if (req.session.passport !== undefined) {
        if (req.session.passport.user !== undefined) {
            //로그인 한 사용자
            res.render('write', {
                title: 'MyBoard',
                session: req.session.passport
            });
        } else {
            res.redirect('/');
        }
    } else {
        res.redirect('/');
    }
});

router.get('/:no', function (req, res, next) {
    var noteNum = req.params.no;
    if (req.session.passport !== undefined) {
        if (req.session.passport.user !== undefined) {
            //로그인 한 사용자
            res.render('detail', {
                title: 'MyBoard',
                session: req.session.passport,
                noteNum: noteNum
            });
        } else {
            res.render('detail', {
                title: 'MyBoard',
                session: {},
                noteNum: noteNum
            });
        }
    } else {
        res.render('detail', {
            title: 'MyBoard',
            session: {},
            noteNum: noteNum
        });
    }

})
module.exports = router;