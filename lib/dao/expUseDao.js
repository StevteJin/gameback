/**
 * Created by easy8in on 16/8/24.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('expUse');

var Handler = function(){
};

Handler.prototype = {
    saveExpUse : function(model,callback){
        db.create(model,function(item){
            if(item.status === status.success.status){
                callback({"model": item.ops[0]});
            }
        });
    },
    aggregate : function(query,callback){
        db.aggregate(query,function(ots){
            callback(ots);
        });
    },
    findExpUseList:function(query,callback){
        db.read(query,function(ots){
            callback(ots);
        });
    }
};

module.exports = Handler;