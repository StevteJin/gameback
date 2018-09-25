/**
 * Created by easy8in on 16/7/1.
 */
var express = require('express');
var router = express.Router();

var timeMgr = require('./../../lib/message/timeMgr');
var orderDao = require('./../../lib/dao/orderDao');

router.get('/', function(req, res, next) {
    res.send('OrderAction is Successfuly!');
});

router.post('/orderPlayerInfo',function(req,res,next){
    var opts = req.body;
    var pid = opts._id;
    var nickName = opts.nickName;
    var stime = timeMgr.getZeroTimestampOfYMD(opts.start);
    var etime = timeMgr.getZeroTimestampOfYMD(opts.end);
    var queryStr = {"pid":pid,"timestamp":{$gte:stime,$lte:etime}};
    var query = [
        {$match:{"pid":pid,"timestamp":{$gte:stime,$lte:etime}}},
        {
            $group: {
                _id: "$nickName",
                count: { $sum: 1},
                total: { $sum: "$payCount" }
            }
        },
        { $sort: { total: -1 } }
    ];

    var rs = {};
    var dao = new orderDao();
    dao.aggregate(query,function(ots){
        if(ots.length > 0){
            rs = ots[0];
            dao.findOrderList(queryStr,function(ims){
                rs.items = ims.items;
                res.send(rs);
            });
        }else{
            rs = { _id: nickName, count: 0, total: 0,items:[] };
            res.send(rs);
        }
    });
});

router.get('/orderRank',function(req,res,next){
    var dao = new orderDao();
    var query = [
        {
            $group: {
                _id: "$nickName",
                count: { $sum: 1},
                total: { $sum: "$payCount" }
            }
        },
        { $sort: { total: -1 } },
        {$limit:20}
    ];

    dao.aggregate(query,function(ots){
        res.send(ots);
    });
});

router.get('/orderLv',function(req,res,next){
    var dao = new orderDao();
    var query = [
        {
            $group: {
                _id: "$lv",
                count: { $sum: 1},
                total: { $sum: "$payCount" }
            }
        },
        { $sort: { _id: 1 } }
    ];

    dao.aggregate(query,function(ots){
        res.send(ots);
    });
});

router.get('/orderFirstRechLv',function(req,res,next){
    var dao = new orderDao();
    var query = [
        {$match:{"firstRech":"first"}},
        {
            $group: {
                _id: "$lv",
                count: { $sum: 1},
                total: { $sum: "$payCount" }
            }
        },
        { $sort: { _id: 1 } }
    ];

    dao.aggregate(query,function(ots){
        res.send(ots);
    });
});

router.post('/orderList',function(req,res,next){
    var opts = req.body;
    var stime = timeMgr.getZeroTimestampOfYMD(opts.start);
    var etime = timeMgr.getZeroTimestampOfYMD(opts.end);
    var orderid = opts.orderid;
    var nickName = opts.nickName;
    var rs = {"msg":"","dts":[]};
    var query = {};
    if(!(etime > stime)){
        rs.msg = "EntTime must gt StartTime!";
        res.send(rs);
    }else{
        if(!(nickName === "")){
            query.nickName = nickName;
        }
        query.timestamp = {$gte:stime,$lte:etime};
        if(!(orderid === "")){
            query = {"orderid":orderid};
        }

        var dao = new orderDao();
        //console.info(query);
        dao.findOrderList(query,function(ots){
            //console.info(ots);
            if(ots.status === 200){
                rs.dts = ots.items;
            }
            rs.msg = "success!";
            //console.info(rs);
            res.send(rs);
        });
    }
});

module.exports = router;