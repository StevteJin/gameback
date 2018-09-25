var pushEventName = require("./../../lib/consts/pushEventName");
var broadcastDao = require("./../../lib/dao/broadcastDao");
var mailDao = require("./../../lib/dao/mailDao");
var async = require("async");

var Handler = function(){

};

var mailBoxMgr = module.exports = Handler;

//客户端通知模块
mailBoxMgr.getMails = function(opts,callback1){
    async.waterfall([
        function(callback){
            var dao = new broadcastDao();
            dao.load({"type":"sys","svrName":opts.svrName},function(outs){
                if(outs.code === 200){
                    var arr = [];
                    outs.res.forEach(function(broad){
                        arr.push({
                            "eventname":pushEventName.clientEvent.onBroadcast,
                            "args":broad
                        });
                    });
                }
                callback(null,arr);
            });
        },
        function(arg,callback){
            var dao = new broadcastDao();
            dao.load({},function(outs){
                if(outs.code === 200){
                    outs.res.forEach(function(broad){
                        arg.push({
                            "eventname":pushEventName.clientEvent.onBroadcast,
                            "args":broad
                        });
                    });
                    callback(null,arg);
                }
            });
        },
        function(arg,callback){
            var dao = new mailDao();
            dao.loadMail(opts.pid,function(mails){
                if(mails.length > 0){
                    arg.push({
                        "eventname":pushEventName.clientEvent.onNewMails,
                        "args":mails
                    })
                }
                callback(null,arg);
            });
        }
    ], function (err, result) {
        // result now equals 'done'
        //console.info(result);
        callback1(result);
    });
};