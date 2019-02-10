var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('write', { title: 'Express' });
  });

router.get('/:no', function(req, res, next) {
    var noteNum = req.params.no;
    res.render('detail', { title: 'Express', noteNum: noteNum});
})
module.exports = router;
