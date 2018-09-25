/**
 * Created by easy8in on 16/8/8.
 */
var express = require('express');
var router = express.Router();

var timeMgr = require("./../../lib/message/timeMgr");
var propsMgr = require("./../../lib/message/propsMgr");
var outDao = require("./../../lib/dao/propsOutDao");
var useDao = require("./../../lib/dao/propsUseDao");
var expUseDao = require("./../../lib/dao/expUseDao");

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/outProps',function(req,res,next){
    var opts = req.body;
    var stime = timeMgr.getZeroTimestampOfYMD(opts.start);
    var etime = timeMgr.getZeroTimestampOfYMD(opts.end);
    var propsId = opts.propsId;
    var queryStr = {"propsId":propsId,"timestamp":{$gte:stime,$lte:etime}};
    var query = [
        {$match:{"propsId":propsId,"timestamp":{$gte:stime,$lte:etime}}},
        {
            $group: {
                _id: "$propsId",
                count: { $sum: 1},
                total: { $sum: "$count" }
            }
        }
    ];

    var rs = {};
    var dao = new outDao();
    dao.aggregate(query,function(ots){
        if(ots.length > 0){
            rs = ots[0];
            if(propsId == "3001"){
                rs._id = "diamond";
            }else if(propsId == "3000"){
                rs._id = "gold";
            }else {
                rs._id = "props";
            }
            dao.findOutList(queryStr,function(ims){
                rs.items = ims.items;
                res.send(rs);
            });
        }else{
            rs = { _id:"", count: 0, total: 0,items:[] };
            res.send(rs);
        }
    });
});

router.post('/useProps',function(req,res,next){
    var opts = req.body;
    var stime = timeMgr.getZeroTimestampOfYMD(opts.start);
    var etime = timeMgr.getZeroTimestampOfYMD(opts.end);
    var propsId = opts.propsId;
    var queryStr = {"propsId":propsId,"timestamp":{$gte:stime,$lte:etime}};
    var query = [
        {$match:{"propsId":propsId,"timestamp":{$gte:stime,$lte:etime}}},
        {
            $group: {
                _id: "$propsId",
                count: { $sum: 1},
                total: { $sum: "$count" }
            }
        }
    ];

    var rs = {};
    var dao = new useDao();
    dao.aggregate(query,function(ots){
        if(ots.length > 0){
            rs = ots[0];
            if(propsId == "3001"){
                rs._id = "diamond";
            }else if(propsId == "3000"){
                rs._id = "gold";
            }else {
                rs._id = "props";
            }
            dao.findUseList(queryStr,function(ims){
                rs.items = ims.items;
                res.send(rs);
            });
        }else{
            rs = { _id:"", count: 0, total: 0,items:[] };
            res.send(rs);
        }
    });
});

router.post('/ouPlayerInfo',function(req,res,next){
    var opts = req.body;
    //console.info(opts);
    //var opts = { nickName: '萧秋', _id: '576aa6d9ace0470e3277cb2e' };
    var query = [
        {$match:{"pid":opts._id}},
        {
            $group: {
                _id: "$propsName",
                total: { $sum: "$count" }
            }
        },
        {$sort:{_id:-1}}
    ];
    var uo = {};
    var udao = new useDao();
    udao.aggregate(query,function(uts){
        uo.use = uts;
        var odao = new outDao();
        odao.aggregate(query,function(ots){
            uo.out = ots;
            res.send(uo);
        });
    });
});

router.post('/expUse',function(req,res,next){
    var opts = req.body;
    //console.info(opts);
    //var opts = { nickName: '萧秋', _id: '57511e626bb6ebf64af655fc' };
    var eud = new expUseDao();
    eud.findExpUseList({"pid":opts._id},function(ots){
        res.send(ots.items);
    });
});

router.get('/expUseList',function(req,res,next){
    var opts = req.body;
    //console.info(opts);
    //var opts = { nickName: '萧秋', _id: '57511e626bb6ebf64af655fc' };
    var eud = new expUseDao();
    eud.findExpUseList({},function(ots){
        res.send(ots.items);
    });
});

module.exports = router;