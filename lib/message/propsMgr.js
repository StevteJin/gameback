/**
 * Created by easy8in on 16/8/7.
 */
var outDao = require("./../../lib/dao/propsOutDao");
var useDao = require("./../../lib/dao/propsUseDao");
var playerDao = require("./../../lib/dao/playerDao");
var expUseDao = require("./../../lib/dao/expUseDao");
var section = require('./../../conf/SectionConfig.json');
var async = require("async");
var _ = require("underscore")._;
var timeMgr = require("./timeMgr");

var Handler = function(){
};

var propsMgr = module.exports = Handler;

propsMgr.outProps = function(opts,callback){
    var dao = new outDao();
    var props ={"pid":opts.pid,"nickName":opts.nickName,"svrName":opts.svrName,"propsId":opts.propsId + "","propsName":opts.propsName,"count":parseInt(opts.count),"timestamp":timeMgr.getTimestamp()};
    dao.saveOutProps(props,function(ots){
        callback(ots);
    });
};
// 3000金币 3001钻石
propsMgr.useProps = function(opts,callback){
    var dao = new useDao();
    var props ={"pid":opts.pid,"nickName":opts.nickName,"svrName":opts.svrName,"propsId":opts.propsId + "","propsName":opts.propsName,"count":parseInt(opts.count),"timestamp":timeMgr.getTimestamp()};
    dao.saveUseProps(props,function(ots){
        //checkExpUse(opts.pid,opts.nickName,opts.propsId,opts.propsName);
        callback(ots);
    });
};

propsMgr.testCheckExpUse = function(pid,nickName,propsId,propsName){
    checkExpUse(pid,nickName,propsId,propsName);
};

function checkExpUse(pid,nickName,propsId,propsName){
    async.waterfall([
        function(callback){
            var oDao = new outDao();
            oDao.aggregate([
                {$match:{"propsId":propsId,"pid":pid}},
                {
                    $group: {
                        _id: "$propsId",
                        count: { $sum: 1},
                        total: { $sum: "$count" }
                    }
                }
            ],function(outRs){
                callback(null,outRs);
            });
        },
        function(outRs,callback){
            var uDao = new useDao();
            uDao.aggregate([
                {$match:{"propsId":propsId,"pid":pid}},
                {
                    $group: {
                        _id: "$propsId",
                        count: { $sum: 1},
                        total: { $sum: "$count" }
                    }
                }
            ],function(useRs){
                callback(null,outRs,useRs);
            });
        }
    ], function (err, outRs,useRs) {
        var outCount = 0;
        var useCount = 0;
        if(outRs.length > 0){
            outCount = outRs[0].total;
        }
        if(useRs.length > 0){
            useCount = useRs[0].total;
        }
        if(useCount > outCount){
            var model = {"pid":pid,"nickName":nickName,"propsId":propsId,"outTotal":outCount,"useTotal":useCount,"timestamp":timeMgr.getTimestamp()};
            var eud = new expUseDao();
            eud.saveExpUse(model,function(sModel){});

            var r = _.filter(section, function(item){
                        if(item._id == parseInt(propsId)){
                            return item;
                        }
                    });
            var sec = r[0];
            if(useCount - outCount > sec.Section){
                //封号处理
                var pdao = new playerDao();
                pdao.closePlayer(pid,function(ots){});
            }
        }
    });
}

propsMgr.propsOutSearch = function(arr,callback){
    var dao = new outDao();
    dao.aggregate(arr,function(ots){
        callback(ots);
    });
};

propsMgr.propsUseSearch = function(arr,callback){
    var dao = new useDao();
    dao.aggregate(arr,function(ots){
        callback(ots);
    });
};

propsMgr.propsOutSearchItems = function(query,callback){
    var dao = new outDao();
    dao.findOutList(query,function(ots){callback(ots);});
};

propsMgr.propsUseSearchItems = function(query,callback){
    var dao = new useDao();
    dao.findUseList(query,function(ots){callback(ots);});
};
