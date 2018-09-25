/**
 * Created by easy8in on 16/3/18.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('mainichiSign');
var async = require("async");

var Handler = function(){
};

Handler.prototype = {
    addSign : function(opts,callback){
        db.create(opts,function(item){
            callback(item);
        });
    },
    removeSign: function(opts,callback){
        //console.info(opts);
        db.del({'Name':opts.Name,'iid':opts.iid,'Day':opts.Day},function(res){
            callback(res);
        });
    },
    findSign : function(opts,callback){
        db.read({'Name':opts.Name,'iid':opts.iid,'Day':opts.Day},function(res){
            callback(res);
        });
    },
    getSignList : function(callback){
        db.read({},function(res){
            callback(res);
        });
    },
    getTodaySign : function(callback){
        var day = new Date().getDate() + "";
        db.read({"Day":day},function(res){
            callback(res);
        });
    }
};

module.exports = Handler;