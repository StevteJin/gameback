/**
 * Created by easy8in on 16/9/7.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('svr');

var Handler = function(){
};

Handler.prototype = {
    saveSvr : function(model,callback){
        db.read({"svrName":model.svrName},function(ots){
            if(ots.items.length > 0){
                callback({"code":409});
            }else{
                db.create(model,function(ors){
                    callback({"code":200});
                });
            }
        });
    },
    regexFindSvrFieldsByQuery: function(txt,attrName,callback){
        var query = {"svrName":{$regex:txt}};
        db.findFieldsQuery(query,attrName,function(item){
            callback(item.items);
        });
    },
    findSvrList : function(query,callback){
        db.read(query,function(item){
            callback(item.items);
        });
    },
    findSvrFieldsByQuery: function(query,attrName,callback){
        db.findFieldsQuery(query,attrName,function(item){
            callback(item.items);
        });
    },
    findSvrByName : function(svrName,callback){
        var query = {"svrName":svrName};
        db.findFieldsQuery(query,"svrName",function(ots){
            callback(ots);
        });
    },
    updateSvrById: function(id,updateModel,callback){
        db.updateById(id,updateModel,function(ots){
            callback(ots);
        });
    },
    aggregate : function(query,callback){
        db.aggregate(query,function(ots){
            callback(ots);
        });
    },
    findNotice : function(callback){
        db.read({},function(ots){
            callback(ots.items);
        });
    }
};

module.exports = Handler;