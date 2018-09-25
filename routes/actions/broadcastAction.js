/**
 * Created by easy8in on 16/6/25.
 */
var express = require('express');
var router = express.Router();
var broadcastDao = require("./../../lib/dao/broadcastDao");

router.get('/',function(req,res,next){
    res.send("broadcastAction Successfully");
});

router.post('/addSysBroadcast',function(req, res, next){
    var broadcast = {"type":"sys"};
    var opts = req.body;
    //console.info(opts);
    broadcast.content = opts.content;
    broadcast.svrName = opts.svrName;
    var dao = new broadcastDao();
    dao.add(broadcast,function(r){
        var rs = {"msg":""};
        if(r.code === 200){
            rs.msg = "send broadcast success!";
        }else{
            rs.msg = "send broadcast fail!";
        }
        res.send(rs);
    });
});

router.get('/broadcastList',function(req, res, next){
    var svrName = req.query.svrName;
    //console.info(svrName);
    var dao = new broadcastDao();
    dao.load({"type":"sys","svrName":svrName},function(outs){
        var arr = [];
        if(outs.code === 200){
            arr = outs.res;
        }
        res.send(arr);
    });
});

router.post('/delSysBroadcast',function(req, res, next){
    //console.info(req.body);
    var opts = req.body;
    var dao = new broadcastDao();
    dao.delBroadcast(opts._id,function(code){
        var rs = {"code" : 500,"msg":"del broadcast fail!"};

        if(code.status === 200){
            rs.code = code.status;
            rs.msg = "del broadcast success!"
        }
        res.send(rs);
    });
});

module.exports = router;