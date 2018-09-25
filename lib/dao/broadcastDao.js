var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('broadcast');

var broadcastType = {
    SYS:"sys",
    NORMAL : "normal"
};

var defaultCountBySec = 60;
var defaultCount = 5;
var defaultType = broadcastType.NORMAL;

var Handler = function(){
};

Handler.prototype = {
    add: function(opts, callback){
        var type  = opts.type || defaultType;
        var content = opts.content;
        var timestamp = Date.parse(new Date()) / 1000;

        var broadcast = {"type":type,"svrName":opts.svrName,"content":content,"timestamp":timestamp};
        db.create(broadcast,function(item){
            //console.info(item);
            if(item.status === status.success.status){
                callback({"code":200,"res":item.ops[0]});
            }else{
                callback({"code":500,"res":"error!"});
            }
        });
    },
    load : function(opts, callback) {
        var type = opts.type || defaultType;
        var countBySec = opts.countbySec || defaultCountBySec;
        var count = opts.count || defaultCount;
        var timestamp = Date.parse(new Date()) / 1000;
        var startimestamp = timestamp - countBySec;

        var query = {};
        if(type === broadcastType.NORMAL){
            query = {"type":type,"svrName":opts.svrName,"timestamp":{$gt: startimestamp,$lt: timestamp}};
            db.load(query,0,count,function(obj){
                if(obj.status === status.success.status){
                    callback({"code":200,"res":obj.items});
                }else{
                    callback({"code":500,"res":"error!"});
                }
            });
        }else{
            query = {"type":type,"svrName":opts.svrName};
            db.read(query,function(obj){
                if(obj.status === status.success.status){
                    callback({"code":200,"res":obj.items});
                }else{
                    callback({"code":500,"res":"error!"});
                }
            });
        }
    },
    delBroadcast : function(bid,callback){
        db.delById(bid,function(code){
            callback(code);
        });
    }
};

module.exports = Handler;