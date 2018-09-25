/**
 * Created by easy8in on 16/3/27.
 */
var express = require('express');
var router = express.Router();
var gameConfDao = require("./../../lib/dao/gameConfDao");
var bossDao = require("./../../lib/dao/bossDao");

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/reCreateConf',function(req, res, next){
    var dayStr = getYMD(new Date());
    var dayTimestamp =Date.parse(new Date()) / 1000;
    var conf = {
        "confName":"systemConf",
        "dropout":{
            "StartDate":dayTimestamp,
            "EndtDate":dayTimestamp,
            "multiple":1
        },
        "experience":{
            "StartDate":dayTimestamp,
            "EndtDate":dayTimestamp,
            "multiple":1
        },
        "ectype":{
            "day" : dayStr,
            "name": "DragonValley"
        }
    };

    var dao = new gameConfDao();
    dao.loadConf(function(r){
        if(r.items.length > 0){
            dao.delConf(function(r1){
                if(r1.status === 200){
                    dao.createConf(conf,function(r2){
                        if(r2.status === 200){
                            res.send("Create Succes");
                        }
                    })
                }
            })
        }else{
            dao.createConf(conf,function(r2){
                if(r2.status === 200){
                    res.send("Create Succes");
                }
            })
        }
    });
});

router.get('/getConf',function(req, res, next){
    var dao = new gameConfDao();
    dao.loadConf(function(r){
        res.send(r.items[0]);
    });
});

router.post('/updateDropout',function(req, res, next){
    //res.send(req.body)
    var dropout = req.body;
    var dateStrStart = dropout.StartDate + " 00:00:00";
    var dateStrEnd = dropout.EndtDate + " 00:00:00";
    var multiple = parseInt(dropout.multiple);

    dropout.StartDate = Date.parse(new Date(dateStrStart)) / 1000;
    dropout.EndtDate = Date.parse(new Date(dateStrEnd)) / 1000;
    dropout.multiple = multiple;

    var dao = new gameConfDao();
    dao.updateConf({"dropout":dropout},function(r){
        res.send(r);
    });
});

router.post('/updateExp',function(req, res, next){
    var exp = req.body;
    var dateStrStart = exp.StartDate + " 00:00:00";
    var dateStrEnd = exp.EndtDate + " 00:00:00";
    var multiple = parseInt(exp.multiple);

    exp.StartDate = Date.parse(new Date(dateStrStart)) / 1000;
    exp.EndtDate = Date.parse(new Date(dateStrEnd)) / 1000;
    exp.multiple = multiple;

    var dao = new gameConfDao();
    dao.updateConf({"experience":exp},function(r){
        res.send(r);
    });
});

router.get('/getEctype',function(req, res, next){
    var dao = new gameConfDao();
    dao.loadConf(function(r){
        //res.send(r.items[0].ectype);
        var ectype = r.items[0].ectype;
        var dayStr = getYMD(new Date());
        if(ectype.day === dayStr){
            res.send("1");
        }else{
            var et = {
                "day" : dayStr,
                "name": "DragonValley"
            };
            dao.updateConf({"ectype":et},function(r){

            });
            res.send("2");
        }
    });
});

function getYMD(date){
    var y = date.getFullYear();
    var m = date.getMonth() < 10 ? '0' + (date.getMonth()+1) : (date.getMonth()+1);
    var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return y + '-' + m + '-' + d;
}

module.exports = router;