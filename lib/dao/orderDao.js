/**
 * Created by easy8in on 16/6/15.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('order');

var Handler = function(){
};

Handler.prototype = {
    saveOrder : function(order,callback){
        db.create(order,function(item){
            if(item.status === status.success.status){
                callback({"order": item.ops[0]});
            }
        });
    },
    findOrder : function(orderId,callback){
        var query = {"orderid":orderId};
        db.read(query,function(obj){
            if(obj.status === status.success.status){
                callback(obj.items);
            }
        });
    },
    findOrderList : function(query,callbalck){
        db.read(query,function(ots){
            callbalck(ots);
        });
    },
    aggregate : function(query,callback){
        //var query =[];
        db.aggregate(query,function(ots){
            callback(ots);
        });
    }
};

module.exports = Handler;
