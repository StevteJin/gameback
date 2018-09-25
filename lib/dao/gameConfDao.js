/**
 * Created by easy8in on 16/3/18.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('gameConf');
var async = require("async");

var Handler = function(){
};

Handler.prototype = {
    createConf : function(opts,callback){
        db.create(opts,function(item){
            callback(item);
        });
    },
    delConf : function(callback){
        db.del({"confName":"systemConf"},function(res){
            callback(res);
        });
    },
    loadConf : function(callback){
        db.read({"confName":"systemConf"},function(res){
            callback(res);
        });
    },
    updateConf : function(opts,callback){
        db.update({"confName":"systemConf"},opts,function(res){
            callback(res);
        });
    }
};
module.exports = Handler;