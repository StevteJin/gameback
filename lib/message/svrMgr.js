/**
 * Created by easy8in on 16/9/7.
 */
var Handler = function(){
};

var svrDao = require("./../../lib/dao/svrDao");
var timeMgr = require("./timeMgr");
var whiteListMgr = require("./whiteListMgr");

var svrMgr = module.exports = Handler;

svrMgr.createSvr = function(model,callback){
    var dao = new svrDao();
    dao.saveSvr(model,function(ors){
        callback(ors);
    });
};

svrMgr.findSvrByName = function(txt,callback){
    var dao = new svrDao();
    dao.regexFindSvrFieldsByQuery(txt,["svrName","releaseTime","status","language"],function(item){
        callback(item);
    });
};

svrMgr.findSvrIdByName = function(svrName,callback){
    var dao = new svrDao();
    dao.findSvrByName(svrName,function(ots){
        callback(ots.items[0]);
    });
};

svrMgr.findSvrFielsByName = function(svrName,attrName,callback){
    var dao = new svrDao();
    var query = {"svrName":svrName};
    dao.findSvrFieldsByQuery(query,attrName,function(ots){
        callback(ots);
    });
};

svrMgr.saveSvrByID = function(id,model,callback){
    var dao = new svrDao();
    dao.updateSvrById(id,model,function(ots){
        callback(ots);
    });
};

svrMgr.findSvrList = function(opts,callback){
    var uid = opts.uid;
    var query = {};
    if(uid === undefined){
        // query = {"releaseTime":{$lte:timeMgr.getTimestamp()},"svrType":{$ne:"test"}};
        query = {"svrType":{$ne:"test"}};
        var dao = new svrDao();
        dao.findSvrList(query,function(ots){
            callback(ots);
        });
    }else{
        whiteListMgr.findListByUID(uid,function(list){
            if(list.length > 0){
                query = {};
            }else{
                query = {"svrType":{$ne:"test"}}; 
            }
            var dao = new svrDao();
            dao.findSvrList(query,function(ots){
                callback(ots);
            });
        });
    }
};