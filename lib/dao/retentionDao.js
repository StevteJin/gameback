/**
 * Created by easy8in on 16/8/10.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('retention');

var Handler = function(){
};

Handler.prototype = {
    createRetention : function(opts,callback){//1 2 3 4 5 6 7 14 30 60 (len = 9)
        var model = {"date":opts.dateStr,"timestamp":opts.timestamp,"rgCount":opts.rgPlayer.length,"rgPlayer":opts.rgPlayer,"loginCount":[]};
        db.create(model,function(item){
            if(item.status === status.success.status){
                callback({"createRetention": item.ops[0]});
            }
        });
    },
    findRetention: function(query,callback){
        db.read(query,function(ots){
            callback(ots);
        });
    },
    updateRetentionById : function(id,updateModel,callback){
        db.updateById(id,updateModel,function(code){
            callback(code);
        });
    },
    aggregate : function(query,callback){
        db.aggregate(query,function(ots){
            callback(ots);
        });
    },
    loadRetentionSort : function(query,callback){
        db.findFieldsQuerySort(query,["date","rgCount","loginCount"],{"timestamp":1},function(ots){
            callback(ots);
        });
    }
};

module.exports = Handler;