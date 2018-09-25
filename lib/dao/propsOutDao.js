/**
 * Created by easy8in on 16/8/7.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var userEntity = require('./entites/userEntity.json');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('propsOut');

var Handler = function(){
};

Handler.prototype = {
    saveOutProps : function(props,callback){
        db.create(props,function(item){
            if(item.status === status.success.status){
                callback({"props": item.ops[0]});
            }
        });
    },
    aggregate : function(query,callback){
        db.aggregate(query,function(ots){
            callback(ots);
        });
    },
    findOutList:function(query,callback){
        db.read(query,function(ots){
            callback(ots);
        });
    }
};

module.exports = Handler;