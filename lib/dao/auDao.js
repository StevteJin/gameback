/**
 * Created by easy8in on 16/5/23.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var timeMgr = require('./../message/timeMgr');
var _ = require("underscore")._;
var db = new Monogo('loginLogs');
var async = require("async");

var Handler = function(){
};

Handler.prototype = {
    createLogs : function(opts,callback){
        var timestamp = timeMgr.getTimestamp();
        var ymd = timeMgr.getTodayDate();
        var model = {"pid":opts.pid,"lv":opts.lv,"nickName":opts.nickName,"svrName":opts.svrName,"loginTime":timestamp,"longTime":1,"date":ymd};
        db.create(model,function(item){
            if(item.ops.length > 0){
                callback(item.ops[0]);
            }else{
                callback(null);
            }
        });
    },
    readLogs : function(query,callback){
        db.read(query,function(ots){callback(ots);});
    },
    updateLogs : function(lib,updateModel,callback){
        db.updateById(lib,updateModel,function(ots){
            callback(ots);
        });
    },
    refreshLogs : function(lid,callback){
        db.findById(lid,function(logs){
            if(logs.status === status.success.status
                && logs.items.length > 0){
                var lg = logs.items[0];
                var timestamp = timeMgr.getTimestamp();
                var longTime = timestamp - lg.loginTime;
                db.updateById(lid,{"longTime":longTime},function(refLogs){
                    if(refLogs.status === status.success.status){
                        callback({"longTime":longTime});
                    }else{
                        callback({"longTime":0});
                    }
                });
            }else{
                callback({"longTime":0});
            }
        });
    },
    DAU : function(callback){
        db.distinctCount("pid",{ "loginTime" : { $gte: timeMgr.getTodayZeroTimestamp() }},function(r){
            callback(r);
        });
    },
    DAUTimeSum : function(callback){
        db.sum("longTime",{ "loginTime" : { $gte: timeMgr.getTodayZeroTimestamp() }},function(r){
            callback(r);
        });
    },
    WAU : function(callback){
        var time7 = 60 * 60 * 24 * 7;
        var timestamp = timeMgr.getTodayZeroTimestamp() - time7;
        db.distinctCount("pid",{ "loginTime" : { $gte: timestamp }},function(r){
            callback(r);
        });
    },
    TWAU : function(callback){
        var time7 = 60 * 60 * 24 * 14;
        var timestamp = timeMgr.getTodayZeroTimestamp() - time7;
        db.distinctCount("pid",{ "loginTime" : { $gte: timestamp }},function(r){
            callback(r);
        });
    },
    WAUTimeSum : function(callback){
        var time7 = 60 * 60 * 24 * 7;
        var timestamp = timeMgr.getTodayZeroTimestamp() - time7;
        db.sum("longTime",{ "loginTime" : { $gte: timestamp }},function(r){
            callback(r);
        });
    },
    MAU : function(callback){
        var time30 = 60 * 60 * 24 * 30;
        var timestamp = timeMgr.getTodayZeroTimestamp() - time30;
        db.distinctCount("pid",{ "loginTime" : { $gte: timestamp } },function(r){
            callback(r);
        });
    },
    MAUTimeSum : function(callback){
        var time30 = 60 * 60 * 24 * 30;
        var timestamp = timeMgr.getTodayZeroTimestamp() - time30;
        db.sum("longTime",{ "loginTime" : { $gte: timestamp } },function(r){
            callback(r);
        });
    },

    StartCount:function(callback){
        db.count({ "loginTime" : { $gte: timeMgr.getTodayZeroTimestamp() } },function(r){
            callback(r);
        });
    },
    aggregate : function(query,callback){
        db.aggregate(query,function(ots){
            callback(ots);
        });
    }
};

module.exports = Handler;