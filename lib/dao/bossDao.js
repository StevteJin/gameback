/**
 * Created by easy8in on 16/3/23.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('boss');
var async = require("async");

var Handler = function(){
};

Handler.prototype = {
    addBoss : function(opts,callback){
        db.create(opts,function(item){
            callback(item);
        });
    },
    removeBoss: function(opts,callback){
        db.del({'svrName':opts.svrName,'week':opts.week,'bid':opts.bid,'StartTime':opts.StartTime},function(res){
            callback(res);
        });
    },
    findBoss : function(opts,callback){
        db.read({'svrName':opts.svrName,'week':opts.week,'bid':opts.bid,'StartTime':opts.StartTime},function(res){
            callback(res);
        });
    },
    getBossList : function(svrName,callback){
        db.read({"svrName":svrName},function(res){
            callback(res);
        });
    },
    getTodayBossList : function(callback){
        var day = new Date().getDay();
        var dayStr = day === 0 ? "7" : day + "";
        db.read({"week":dayStr},function(res){
            callback(res);
        });
    }
};

module.exports = Handler;