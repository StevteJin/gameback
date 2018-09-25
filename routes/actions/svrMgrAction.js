/**
 * Created by easy8in on 16/9/5.
 */
var express = require('express');
var router = express.Router();

var timeMgr = require("./../../lib/message/timeMgr");
var svrMgr = require("./../../lib/message/svrMgr");
var playerMgr = require("./../../lib/message/playerMgr");

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/addSvr',function(req,res,next){
    var model = req.body;
    /* status
       1 = 空闲
       2 = 繁忙
       3 = 维护
    */
    model.status = 1;
    model.releaseTime = timeMgr.getTimestampOfDateStr(model.releaseTime);
    //console.info(model);
    //res.send({"code":200});
    /**/
    svrMgr.createSvr(model,function(ots){
        if(ots.code == 200){
            playerMgr.arenaInitPlayer(model.svrName,model.language);
        }
        res.send(ots);
    });
});

router.post('/svrList',function(req,res,next){
    var txt = req.body.txt;
    if(txt.length <= 0){
        res.send([]);
    }else{
        svrMgr.findSvrByName(txt,function(list){
            res.send(list);
        });
    }
});

router.post('/editerAct',function(req,res,next){
    //console.info(req.body);
    var opts = req.body;
    var model = {};
    if(opts._id ==='' && opts._id.length < 1){
        res.send({'msg':"Please select SvrName!"});
    }else{
        model[opts.type] ={"startTime":timeMgr.getTimestampOfDateStr(opts.startTime),"endingTime":timeMgr.getTimestampOfDateStr(opts.endingTime)};
        //console.info(model);
        svrMgr.saveSvrByID(opts._id,model,function(ots){
            res.send({"msg":"save Act Successfully!"});
        });
    }
});

router.post('/chat',function(req,res,next){
    //console.info(req.body);
    var opts = req.body;
    var model = {};
    if(opts._id ==='' && opts._id.length < 1){
        res.send({'msg':"Please select SvrName!"});
    }else{
        model.chatRoomId = opts.chatRoomId;
        svrMgr.saveSvrByID(opts._id,model,function(ots){
            res.send({"msg":"save ChatRoom Successfully!"});
        });
    }
});

router.post('/maintainSvr',function(req,res,next){
    var svrId = req.body._id;
    var svrName = req.body.svrName;
    var model = {"status":3};
    svrMgr.saveSvrByID(svrId,model,function(ots){
        res.send({"msg":"strat maintainSvr[svrName:"+svrName+"] Successfully!"});
    });
});

router.post('/runSvr',function(req,res,next){
    var svrId = req.body._id;
    var svrName = req.body.svrName;
    var model = {"status":1};
    svrMgr.saveSvrByID(svrId,model,function(ots){
        res.send({"msg":"strat runSvr[svrName:"+svrName+"] Successfully!"});
    });
});

module.exports = router;