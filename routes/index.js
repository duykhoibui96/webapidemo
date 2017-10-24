var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Web API Demo' });
});

router.get('/test', function(req, res, next) {
  res.render('test');
});

module.exports = router;
