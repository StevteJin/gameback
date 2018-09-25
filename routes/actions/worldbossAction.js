/**
 * Created by easy8in on 16/3/23.
 */
var express = require('express');
var router = express.Router();
var bossDao = require("./../../lib/dao/bossDao");

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/add',function(req, res, next){
    var boss = req.body;
    var lv = parseInt(boss.Lv);
    var hpBase = parseInt(boss.HPBase);
    var hpStep = parseInt(boss.HPStep);
    boss.HP = lv > 1 ? hpBase + hpStep * (lv - 1) : hpBase;
    console.info(boss);
    //res.send({code:200});

    var dao = new bossDao();
    dao.findBoss(boss,function(m){
        if(m.items.length > 0){
            res.send({code:500,msg:'The ' + boss.Note + ' is here!'});
        }else{
            dao.addBoss(boss,function(item){
                if(item.status === 200){
                    res.send({code:200});
                }
            });
        }
    });
});

router.get('/getBossItemList',function(req, res, next){
    var svrName = req.query.svrName;
    var dao = new bossDao();
    dao.getBossList(svrName,function(items){
        var signList = items.items;
        res.send(signList);
    });
});

router.post('/moveBossItem',function(req, res, next){
    var boss = req.body;
    var dao = new bossDao();
    dao.removeBoss(boss,function(r){
        res.send({code: r.status,msg: r.message});
    });
});

module.exports = router;