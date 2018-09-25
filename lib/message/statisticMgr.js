/**
 * Created by easy8in on 16/6/4.
 */

var async = require("async");
var _ = require("underscore")._;
var playerDao = require("./../../lib/dao/playerDao");
var auDao = require("./../../lib/dao/auDao");
var orderDao = require("./../../lib/dao/orderDao");
var propsUseDao = require("./../../lib/dao/propsUseDao");
var timeMgr = require("./timeMgr");
var retentionDao = require("./../../lib/dao/retentionDao");
var Handler = function(){
};

var statisticMgr = module.exports = Handler;

statisticMgr.realTime = function(callback){
    var realTimeData = {
        "newPlayerCount":0,
        "startCount":0,
        "cAuPlayerCount":0,
        "payPlayerCount":0,
        "payMoneyCount":0,
        "newPayPlayerCount":0
    };
    async.parallel([
        function(next){
            var pDao = new playerDao();
            pDao.newCount(function(r){
                realTimeData.newPlayerCount = r;
                next(null);
            });
        },function(next){
            var uDao = new auDao();
            uDao.StartCount(function(r){
                realTimeData.startCount = r;
                next(null);
            });
        },function(next){
            var uDao = new auDao();
            uDao.DAU(function(r){
                var count = 0;
                if(r.length > 0){
                    count = r[0].count;
                }
                realTimeData.cAuPlayerCount = count;
                next(null);
            });
        },function(next){
            var oDao = new orderDao();
            oDao.aggregate([
                {$match:{"timestamp":{$gte:timeMgr.getTodayZeroTimestamp()}}},
                {
                    $group: {
                        _id: "$nickName",
                        count: { $sum: 1},
                        total: { $sum: "$payCount" }
                    }
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1}
                    }
                }
            ],function(ots){
                if(ots.length > 0){
                    realTimeData.payPlayerCount = ots[0].count;
                }
                next(null);
            });
        },function(next){
            var oDao = new orderDao();
            oDao.aggregate([
                {$match:{"timestamp":{$gte:timeMgr.getTodayZeroTimestamp()}}},
                {
                    $group: {
                        _id:null,
                        total: { $sum: "$payCount" }
                    }
                }
            ],function(ots){
                if(ots.length > 0){
                    realTimeData.payMoneyCount = ots[0].total;
                }
                next(null);
            });
        },function(next){
            var pdao1 = new playerDao();
            pdao1.newFirstRechargePlayer(function(num){
                //console.info(num);
                realTimeData.newPayPlayerCount = num;
                next(null);
            });
        }
    ],function(err){
        callback(realTimeData);
    });
};

statisticMgr.profile = function(callback){
    var profileData = {
        "playerCount":0,
        "wauCount":0,
        "mauCount":0,
        "wauTimeSum":0,
        "mauTimeSum":0,
        "allPayPlayerCount":0,
        "allPayMoneySum":0,
        "oddsPay":0,
        "arpu":0,
        "arppu":0
    };
    async.parallel([
        function(next){
            var dao = new playerDao();
            dao.playerCount(function(count){
                profileData.playerCount = count;
                next(null);
            });
        },function(next){
            var dao = new auDao();
            dao.WAU(function(r){
                profileData.wauCount = r[0].count;
                next(null);
            });
        },function(next){
            var dao = new auDao();
            dao.MAU(function(r){
                profileData.mauCount = r[0].count;
                next(null);
            });
        },function(next){
            var dao = new auDao();
            dao.WAUTimeSum(function(r){
                profileData.wauTimeSum = r[0].sum;
                next(null);
            });
        },function(next){
            var dao = new auDao();
            dao.MAUTimeSum(function(r){
                profileData.mauTimeSum = r[0].sum;
                next(null);
            });
        },function(next){
            var oDao = new orderDao();
            oDao.aggregate([
                {
                    $group: {
                        _id:"$nickName",
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id:null,
                        count: { $sum: 1 }
                    }
                }
            ],function(ots){
                if(ots.length > 0){
                    profileData.allPayPlayerCount = ots[0].count;
                }
                next(null);
            });
        },function(next){
            var oDao = new orderDao();
            oDao.aggregate([
                {
                    $group: {
                        _id:null,
                        total: { $sum: "$payCount" }
                    }
                }
            ],function(ots){
                if(ots.length > 0){
                    profileData.allPayMoneySum = ots[0].total;
                }
                next(null);
            });
        }
    ],function(err){
        var allPlayerCount = profileData.playerCount;
        var payPlayerCount = profileData.allPayPlayerCount;
        var oddsPay = 0;
        if(allPlayerCount > 0 && payPlayerCount > 0){
            oddsPay = parseFloat(payPlayerCount / allPlayerCount).toFixed(4) * 100;
        }
        profileData.oddsPay = oddsPay;
        var payMoney = profileData.allPayMoneySum;
        if(allPlayerCount > 0
            && payPlayerCount > 0
            && payMoney > 0){
            profileData.arpu = parseFloat(payMoney / allPlayerCount).toFixed(2);
            profileData.arppu = parseFloat(payMoney / payPlayerCount).toFixed(2);
        }
        var wts = parseInt(profileData.wauTimeSum / profileData.wauCount);
        var mts = parseInt(profileData.mauTimeSum / profileData.mauCount);
        profileData.wauTimeSum = parseHoursOfsec(wts);
        profileData.mauTimeSum = parseHoursOfsec(mts);
        callback(profileData);
    });
};

statisticMgr.userLeave = function(callback){
    var ulData = {
        wUserLeave : 0,
        wauCount : 0,
        twUserLeave : 0,
        twauCount : 0,
        mUserLeave : 0,
        mauCount : 0
    };

    async.parallel([
        function(next) {
            var dao = new playerDao();
            dao.wUsersLeave(function(count){
                ulData.wUserLeave = count;
                next(null);
            });
        },function(next){
            var dao = new auDao();
            dao.WAU(function(r){
                ulData.wauCount = r[0].count;
                next(null);
            });
        },function(next) {
            var dao = new playerDao();
            dao.twUsersLeave(function(count){
                ulData.twUserLeave = count;
                next(null);
            });
        },function(next){
            var dao = new auDao();
            dao.TWAU(function(r){
                ulData.twauCount = r[0].count;
                next(null);
            });
        },function(next) {
            var dao = new playerDao();
            dao.mUsersLeave(function(count){
                ulData.mUserLeave = count;
                next(null);
            });
        },function(next){
            var dao = new auDao();
            dao.MAU(function(r){
                ulData.mauCount = r[0].count;
                next(null);
            });
        }
    ],function(err){
        callback(ulData);
    });
};

statisticMgr.userLeaveGroupLv = function(callback){
    var data = {
        "wGroupLv":[],
        "twGroupLv":[],
        "mGroupLv":[]
    };
    async.parallel([
        function(next){
            var dao = new playerDao();
            dao.wUsersLeaveGroupLv(function(r){
                data.wGroupLv = r;
                next(null);
            });
        },function(next){
            var dao = new playerDao();
            dao.twUsersLeaveGroupLv(function(r){
                data.twGroupLv = r;
                next(null);
            });
        },function(next){
            var dao = new playerDao();
            dao.mUsersLeaveGroupLv(function(r){
                data.mGroupLv = r;
                next(null);
            });
        }
    ],function(err){
        callback(data);
    })
};

statisticMgr.retentionTimer = function(ymd){
    var tmp = timeMgr.getZeroTimestampOfYMD(ymd);//timeMgr.getTodayZeroTimestamp()
    var start = tmp - 86400;//统计开始日期
    var end = tmp;
    var ymds = [];
    for(var i = 0 ; i < 7; i++){
        var timestamp = start - 86400  * (i + 1);
        ymds.push(timeMgr.getDateOfTimestamp(timestamp));
    }
    ymds.push(timeMgr.getDateOfTimestamp(start - 86400 * 14));
    ymds.push(timeMgr.getDateOfTimestamp(start - 86400 * 30));
    async.parallel([
            function(next){
                var dao = new playerDao();
                dao.findPlayerFieldsByQuery({"svr_createtimestamp":{$gte:start,$lt:end}},"nickName",function(ots){
                    var Arr = [];
                    for(var i = 0;i < ots.items.length;i++){
                        Arr.push(ots.items[i]._id + "");
                    }
                    var opts = {"dateStr":timeMgr.getDateOfTimestamp(start),"timestamp":start,"rgPlayer":Arr};
                    var rDao = new retentionDao();
                    rDao.createRetention(opts,function(ots){
                        next(null);
                    });
                });
            },
            function(next){
                var rDao = new retentionDao();
                var query ={"date":{$in:ymds}};
                rDao.findRetention(query,function(rs){
                    var rets = rs.items;
                    for(var i = 0 ; i<rets.length;i++){
                        var ret = rets[i];
                        retention(ret,ymd);
                    }
                    next(null);
                });
            }
        ],
        function(err, results){
        });
};

statisticMgr.retentionSearch = function(startYmd,endYmd,callback){
    var dao = new retentionDao();
    var start = timeMgr.getZeroTimestampOfYMD(startYmd);
    var end = timeMgr.getZeroTimestampOfYMD(endYmd);
    dao.loadRetentionSort({"timestamp":{$gte:start,$lt:end}},function(ots){
        callback(ots.items);
    });
};

retention = function(ret,ymd){
    //console.info(ret);
    var dao = new auDao();
    dao.aggregate([
        {$match:{"pid":{$in:ret.rgPlayer},"date":ymd}},
        {
            $group: {
                _id:"$pid",
                total: { $sum:1}
            }
        },
        {
            $group:{
                _id:null,
                count:{$sum:1}
            }
        }
    ],function(ots){
        //console.info(ots);
        var count = 0 ;
        if(ots.length > 0){
           count = ots[0].count
        }
        var loginCount = ret.loginCount;
        loginCount.push(count);
        var rDao = new retentionDao();
        var updateModel = {"loginCount":loginCount};
        rDao.updateRetentionById(ret._id+"",updateModel,function(code){
            console.info(ret.date +" retention is exec!");
        });
    });
};

statisticMgr.everyDayPlayerUsetSate = function(start,end,callback){
    var dao = new auDao();
    dao.aggregate([
        {$match:{"loginTime":{$gte:start,$lt:end}}},
        {
            $group:{
                _id:{dt:"$date",player:"$pid"},
                playerCount:{$sum:1},
                longinTime : {$sum:"$longTime"}
            }
        },
        {$project:{
            "date":"$_id.dt",
            "playerCount":"$playerCount",
            "longinTime":"$longinTime"
        }},
        {
            $group:{
                _id:"$date",
                total : {$sum:"$playerCount"},
                count : {$sum:1},
                sum : {$sum:"$longinTime"}
            }
        }
    ],function(ots){
        ots.sort(function(a,b){
            return timeMgr.getTimestampOfDate(a._id) - timeMgr.getTimestampOfDate(b._id);
        });
        var items = [];
        for(var i = 0;i<ots.length;i++){
            var r = ots[i];
            var rs ={
                "date": r._id,
                "allLoginCount": r.total,
                "loginCount": r.count,
                "avgLoginCount":parseInt(r.total/ r.count),
                "allLoginSec" : parseHoursOfsec(r.sum),
                "avgLoginSec" : parseHoursOfsec(parseInt(r.sum/ r.count))
            };
            items.push(rs);
        }
        callback(items);
    });
};

statisticMgr.everyDayDiamondUseState = function(date,callback){
    var dao = new propsUseDao();
    var start = timeMgr.getTimestampOfDate(date);
    var end = start + 86400;
    dao.aggregate([
        {$match:{"propsId":"3001","timestamp":{$gte:start,$lt:end}}},
        {$project:{
            "nickName":1
        }},
        {
            $group:{
                _id:"$pid",
                total:{$sum:"$count"}
            }
        }
    ],function(ots){});
};

function parseHoursOfsec(longSec){
    var hours = parseInt(longSec / 3600);
    var minute =parseInt(longSec % 3600 / 60);
    var sescc = longSec % 3600 % 60;
    var hStr = hours > 9 ? hours : '0'+ hours;
    var mStr = minute > 9? minute : '0' + minute;
    var sStr = sescc > 9 ? sescc : '0'+ sescc;
    return hStr+":"+mStr+":"+sStr;
}