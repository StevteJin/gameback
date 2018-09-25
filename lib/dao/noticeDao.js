/**
 * Created by easy8in on 16/8/24.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('notice');

var Handler = function(){
};

Handler.prototype = {
    saveNotice : function(model,callback){
        db.read({"svrName":model.svrName},function(ots){
            if(ots.items.length > 0){
                var nt = ots.items[0];
                db.updateById(nt._id+"",model,function(ots){
                    callback();
                });
            }else{
                db.create(model,function(item){
                    if(item.status === status.success.status){
                        callback();
                    }
                });
            }
        });
    },
    aggregate : function(query,callback){
        db.aggregate(query,function(ots){
            callback(ots);
        });
    },
    findNotice : function(svrName,callback){
        db.read({"svrName":svrName},function(ots){
            callback(ots.items);
        });
    }
};

module.exports = Handler;