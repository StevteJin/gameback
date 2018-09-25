/**
 * Created by easy8in on 16/6/6.
 */
var express = require('express');
var router = express.Router();

var statisticMgr = require('./../../lib/message/statisticMgr');
var timeMgr = require('./../../lib/message/timeMgr');

router.get('/', function(req, res, next) {
    res.send('respond with a statisticAction');
});

router.get('/retexec',function(req,res,next){
    statisticMgr.retentionTimer(timeMgr.getTodayDate());
    res.send("Successfully");
});

router.post('/retSeatch',function(req,res,next){
    var opts = req.body;
    //var stime = timeMgr.getZeroTimestampOfYMD(opts.start);
    //var etime = timeMgr.getZeroTimestampOfYMD(opts.end);
    statisticMgr.retentionSearch(opts.start,opts.end,function(rs){
        res.send(rs);
    });
});

router.get('/realTime', function(req, res, next) {
    statisticMgr.realTime(function(r){
        res.send(r);
    });
});

router.get('/profile', function(req, res, next) {
    statisticMgr.profile(function(r){
        res.send(r);
    });
});

router.get('/userLeave', function(req, res, next) {
    statisticMgr.userLeave(function(r){
        res.send(r);
    });
});

router.get('/userLeaveGroupLv', function(req, res, next) {
    statisticMgr.userLeaveGroupLv(function(r){
        res.send(r);
    });
});

router.post('/everyDayPlayerUse',function(req,res,next){
    var opts = req.body;
    var start = timeMgr.getZeroTimestampOfYMD(opts.start);
    var end = timeMgr.getZeroTimestampOfYMD(opts.end) + 86400;
    statisticMgr.everyDayPlayerUsetSate(start,end,function(ots){
        res.send(ots);
    })
});

module.exports = router;