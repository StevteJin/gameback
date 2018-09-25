var express = require('express');
var router = express.Router();
var ectypeDao = require("./../../lib/dao/ectypeDao");

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

var Arrs = [];

router.post('/add',function(req, res, next){
  var ectype = req.body;
  var dao = new ectypeDao();

  dao.findEctype(ectype,function(m){
    if(m.items.length > 0){
      res.send({code:500,msg:'The ' + ectype.Start + ' is here!'});
    }else{
      dao.addEctype(ectype,function(item){
        if(item.status === 200){
          res.send({code:200});
        }
      });
    }
  });
});

router.get('/getEctypeList',function(req, res, next){
  var dao = new ectypeDao();
  dao.getEctypeList(function(items){
    var ectypeList = items.items;
    res.send(ectypeList);
  });
});

router.post('/moveEctype',function(req, res, next){
  var ectype = req.body;

  var dao = new ectypeDao();
  dao.removeEctype(ectype,function(r){
    res.send({code: r.status,msg: r.message});
  });
});

module.exports = router;
