/**
 * Created by easy8in on 16/6/19.
 */
var campaignConfig = require('./../../conf/campaignConfig.json');
var timeMgr = require('./timeMgr');
var svrMgr = require('./svrMgr');
var mailDao = require('./../dao/mailDao');
var propsUseDao = require('./../dao/propsUseDao');

var Handler = function(){
};

var campaignMgr = module.exports = Handler;

campaignMgr.recharge = function(pid,svrName,priceInfo){
    svrMgr.findSvrFielsByName(svrName,"recharge",function(ots){
        if(ots.length > 0){
            var rech = ots[0].recharge;
            if(undefined != rech){
                var timestamp = timeMgr.getTimestamp();
                var start = rech.startTime;
                var end = rech.endingTime;
                var avgCount = 1;
                var count = parseInt(priceInfo.Count * avgCount);
                if(timestamp > start && timestamp < end){
                    var mail = {"pid":pid + "","theme":"","content": "","rewardList":"3001","count":count,"from":"Shop"};
                    var dao = new mailDao();
                    dao.sendMailToPlayer(mail,function(mail){});
                }
            }
        }
    });
};

campaignMgr.rechargeInfo = function(){
    var rech = campaignConfig["recharge"];
    return {"startTime":timeMgr.getTimestampOfDate(new Date(rech.startTime)),"endTime":timeMgr.getTimestampOfDate(new Date(rech.endingTime))};
};

campaignMgr.upgrade = function(){
    var upg = campaignConfig["upgrade"];
    return {"startTime":timeMgr.getTimestampOfDate(new Date(upg.startTime)),"endTime":timeMgr.getTimestampOfDate(new Date(upg.endingTime))};
};

campaignMgr.legend = function(){
    var leg = campaignConfig["legend"];
    return {"startTime":timeMgr.getTimestampOfDate(new Date(leg.startTime)),"endTime":timeMgr.getTimestampOfDate(new Date(leg.endingTime))};
};

campaignMgr.aggregateConsumption = function(pid,startTime,endingTime,callback){
    // var leg = campaignConfig["aggregateConsumption"];
    //var model = {"startTime":timeMgr.getTimestampOfDate(new Date(leg.startTime)),"endTime":timeMgr.getTimestampOfDate(new Date(leg.endingTime))};
    var model = {};
    var udao = new propsUseDao();
    udao.aggregate([
        {$match:{"propsId":"3001","pid":pid,"timestamp":{$gt:parseInt(startTime),$lt:parseInt(endingTime)}}},
        {
            $group: {
                _id: "$propsId",
                count: { $sum: 1},
                total: { $sum: "$count" }
            }
        }
    ],function(outRs){
        var useCount = 0;
        if(outRs.length > 0){
            useCount = outRs[0].total;
        }
        model.useCount = useCount;
        callback(model);
    });
};