/**
 * Created by easy8in on 16/3/18.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('ectype');
var async = require("async");

var Handler = function(){
};

Handler.prototype = {
    addEctype : function(opts,callback){
        db.create(opts,function(item){
            callback(item);
        });
    },
    removeEctype: function(opts,callback){
        //console.info(opts);
        db.del({'Start':opts.Start},function(res){
            callback(res);
        });
    },
    findEctype : function(opts,callback){
        db.read({'Start':opts.Start},function(res){
            callback(res);
        });
    },
    getEctypeList : function(callback){
        db.read({},function(res){
            callback(res);
        });
    },
    getTodayEctypeList:function(callback){
        var dt = getYMD(new Date());
        db.read({"Start":dt},function(res){
            callback(res);
        });
    }
};
function getYMD(date){
    var y = date.getFullYear();
    var m = date.getMonth() < 10 ? '0' + (date.getMonth()+1) : (date.getMonth()+1);
    var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return y + '-' + m + '-' + d;
}

module.exports = Handler;