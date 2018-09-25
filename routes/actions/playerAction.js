/**
 * Created by easy8in on 16/6/26.
 */
var express = require('express');
var router = express.Router();

var playerMgr = require('./../../lib/message/playerMgr');
var playerDao = require('./../../lib/dao/playerDao');
var mailDao = require('./../../lib/dao/mailDao');

router.get('/',function(req,res,next){
    res.send("playerAction Successfully");
});

router.post('/findPlayer',function(req, res, next){
    var txt = req.body.txt;
    var dao = new playerDao();
    //var attrName = ["nickName","svr_combat","role","vip","vipExp","svr_createtimestamp","svr_savetimestamp"];
    if(txt.length <= 0){
        res.send([]);
    }else{
        dao.regexFindPlayerFieldsByQuery(txt,["nickName","uid"],function(ots){
            var rs = [];
            if(ots.status === 200){
                rs = ots.items;
            }
            res.send(rs);
        });
    }
});

router.post('/searchPlayer',function(req,res,next){
    //console.info(req.body);
    playerMgr.webPlayer(req.body._id,function(ots){
        //console.info(ots);
        res.send(ots);
    });
});

router.post('/closePlayer',function(req,res,next){
    //console.info(req.body);
    var opts = req.body;
    var rs = {};
    if(opts._id === ""){
        rs.msg = "Please select player!";
        res.send(rs);
    }else{
        var dao = new playerDao();
        dao.closePlayer(opts._id,function(code){
            //console.info(code);
            if(code.status === 200){
                rs.code = 200;
                rs.msg = "close " + opts.nickName + " success!";
            }else{
                rs.code = 500;
                rs.msg = "close " + opts.nickName + " fail!";
            }
            res.send(rs);
        });
    }
});

router.post('/unclosePlayer',function(req,res,next){
    var opts = req.body;
    var pid = req.body.pid;
    var dao = new playerDao();
    var rs = {"code":500};
    dao.unclosePlayer(pid,function(code){
        if(code.status === 200){
            rs.code = 200;
            rs.msg = "unClose " + opts.nickName + " success!";
        }else{
            rs.msg = "unClose " + opts.nickName + " fail!";
        }
        res.send(rs);
    });
});

router.get('/closePlayerList',function(req,res,next){
    var dao = new playerDao();
    dao.closePlayerList(function(ots){
        //console.info(ots);
        res.send(ots.items);
    });
});

router.post('/addProps',function(req,res,next){
    var opts = req.body;
    console.info(opts);
    if(!IsNum(opts.count)){
        res.send({"msg":"count must number!"});
    }else{
        var mail = {"pid":opts._id + "","theme":"GM","content":"","rewardList":opts.propsID,"count":opts.count,"from":"GM"};
        var dao = new mailDao();
        dao.sendMailToPlayer(mail,function(mail){
        });
        res.send({"msg":"success"});
    }
});

router.post('/arenaCustom',function(req,res,next){
    var opts = req.body;
    var pid = opts.pid;
    var custom = [];
    if(opts.nickName1){
        custom.push(opts.nickName1);
    }
    if(opts.nickName2){
        custom.push(opts.nickName2);
    }
    if(opts.nickName3){
        custom.push(opts.nickName3);
    }

    //console.info(pid);
    //console.info(custom);
    playerMgr.arenaCustomPlayer(pid,custom,function(ots){
        console.info(ots);
    });
    res.send({"msg":"success"});
});

function IsNum(s)
{
    if(s!=null){
        var r,re;
        re = /\d*/i; //\d表示数字,*表示匹配多个数字
        r = s.match(re);
        return (r==s)?true:false;
    }
    return false;
}

module.exports = router;