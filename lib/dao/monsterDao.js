/**
 * Created by easy8in on 16/3/18.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('monster');
var async = require("async");

var Handler = function(){
};

Handler.prototype = {
    addMonster : function(opts,callback){
        db.create(opts,function(item){
            callback(item);
        });
    },
    removeMonster: function(opts,callback){
        //console.info(opts);
        db.del({'svrName':opts.svrName,'MonsterName':opts.MonsterName,'mid':opts.mid},function(res){
            callback(res);
        });
    },
    findMonster : function(opts,callback){
        db.read({'svrName':opts.svrName,'MonsterName':opts.MonsterName,'mid':opts.mid},function(res){
            callback(res);
        });
    },
    getMonsterList : function(svrName,callback){
        db.read({"svrName":svrName},function(res){
            callback(res);
        });
    },
    getTodayMonster:function(svrName,callback){
        var timestamp = Date.parse(new Date()) / 1000;
        var query = {"svrName":svrName,"End":{ $gt: timestamp }};
        db.read(query,function(res){
            callback(res);
        });
    }
};

module.exports = Handler;