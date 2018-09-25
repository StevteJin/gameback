/**
 * Created by easy8in on 16/8/24.
 */
var express = require('express');
var router = express.Router();

var timeMgr = require('./../../lib/message/timeMgr');
var svrMgr = require('./../../lib/message/svrMgr');
var noticeDao = require('./../../lib/dao/noticeDao');

router.get('/', function(req, res, next) {
    res.send('noticeAction is Successfuly!');
});

router.post('/getNotice',function(req, res, next){
    var svrName = req.body.svrName;
    var dao = new noticeDao();
    dao.findNotice(svrName,function(list){
        if(list.length > 0){
            res.send(list[0]);
        }else{
            res.send({"notice":""});
        }
    });
    //console.info(req.body);
});

router.post('/saveNotice',function(req, res, next){
    var opts = req.body;
    //console.info(opts);
    svrMgr.findSvrList({},function (list) {
        for (var i=0;i<list.length;i++){
           var ssvr = list[i];
           var model = {"svrName":ssvr.svrName,"notice":opts.notice,"timestamp":timeMgr.getTimestamp()};
           var dao = new noticeDao();
           dao.saveNotice(model,function(){});
       }
       res.send({"code":200});
    });
});

module.exports = router;
