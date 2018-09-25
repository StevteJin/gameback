var express = require('express');
var router = express.Router();
var messageMgr = require("./../lib/message/messageMgr");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
  messageMgr.executeMsg(req,res);
});

module.exports = router;