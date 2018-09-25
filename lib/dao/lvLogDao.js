/**
 * Created by easy8in on 16/11/10.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('lvLogs');

var Handler = function(){
};

Handler.prototype = {
    save : function(logs,callback){
        db.create(logs,function(item){
            if(item.status === status.success.status){
                callback({"logs": item.ops[0]});
            }
        });
    },
    aggregate : function(query,callback){
        db.aggregate(query,function(ots){
            callback(ots);
        });
    },
    findList:function(query,callback){
        db.read(query,function(ots){
            callback(ots);
        });
    }
};

module.exports = Handler;