var express = require('express');
var router = express.Router();
var monsterDao = require("./../../lib/dao/monsterDao");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/add',function(req, res, next){
  var monster = req.body;
  var dao = new monsterDao();
  dao.findMonster(monster,function(m){
    if(m.items.length > 0){
      res.send({code:500,msg:'The ' + monster.MonsterName + ' is here!'});
    }else{
      var dateStrStart = monster.Start + " 00:00:00";
      var dateStrEnd = monster.End + " 00:00:00";

      monster.Start = Date.parse(new Date(dateStrStart)) / 1000;
      monster.End = Date.parse(new Date(dateStrEnd)) / 1000;

      dao.addMonster(monster,function(item){
        if(item.status === 200){
          res.send({code:200});
        }
      });
    }
  });
});

router.get('/getUsingMonster',function(req, res, next){
  var svrName = req.query.svrName;
  var dao = new monsterDao();
  dao.getMonsterList(svrName,function(items){
    var monsterList = items.items;
    var td = Date.parse(new Date()) / 1000;
    for(var i = 0 ; i < monsterList.length; i++ ){
      var monster = monsterList[i];

      if(td > monster.End){
        monster.Status = 'Overdue';
      }else{
        monster.Status = 'Using';
      }
    }
    res.send(monsterList);
  });
});

router.post('/moveUsingMonster',function(req, res, next){
  var monster = req.body;

  var dao = new monsterDao();
  dao.removeMonster(monster,function(r){
    res.send({code: r.status,msg: r.message});
  });
});

module.exports = router;
