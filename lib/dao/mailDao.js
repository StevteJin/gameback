var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('mails');
var playerDao = require("./../../lib/dao/playerDao");
var async = require("async");


var Handler = function(){
};

var mailsType = {
    ACT : "activity",
    PY: "player"
};

//nItemList
Handler.prototype = {
    loadMail : function(pid,callback1){
        var pDao = new playerDao();
        async.waterfall([
            function(callback){//获取玩家信息
                var opts ={"pid":pid,"mailTimestamp":1456375355};
                pDao.getMailTimestamp(pid,function(item){
                    opts.mailTimestamp = item.mailTimestamp;
                    callback(null,opts);
                });
            },
            function(opts,callback){//处理玩家信息
                var mailTimestamp = opts.mailTimestamp;
                var nowTimestamp = Date.parse(new Date()) / 1000;

                //业务 获取邮件，可获取7天以内的邮件
                if(nowTimestamp - mailTimestamp > 604800){ //如果领取时间超过7天 领取时间为当前时间的7天前
                    mailTimestamp = nowTimestamp - 604800;
                }

                opts.mailTimestamp = mailTimestamp;
                callback(null,opts);
            },
            function(opts,callback){
                var pid = opts.pid;
                var mailTimestamp = opts.mailTimestamp;
                var query = {"pid":pid,"type":mailsType.PY,"timestamp":{ $gte: mailTimestamp }};
                db.read(query,function(ores){
                    var mailArr = [];
                    if(ores.status === status.success.status){
                        ores.items.forEach(function(mail){
                            mailArr.push(mail);
                        });
                    }
                    callback(null,opts,mailArr);
                });
            },
            function(opts,mailArr,callback){
                var mailTimestamp = opts.mailTimestamp;
                var query = {"type":mailsType.ACT,"timestamp":{ $gte: mailTimestamp }};
                db.read(query,function(ores){
                    if(ores.status === status.success.status){
                        ores.items.forEach(function(mail){
                            mailArr.push(mail);
                        });
                    }
                    callback(null,opts,mailArr);
                });
            },
            function(opts,mailArr,callback){
                pDao.updateMailTimestamp(opts.pid,Date.parse(new Date()) / 1000);
                callback(null,mailArr);
            }
        ], function (err, result) {
            callback1(result);
        });

    },
    sendMailToPlayer : function(opts,callback){
        opts.timestamp = Date.parse(new Date()) / 1000;
        opts.type = mailsType.PY;
        //console.info(opts);
        db.create(opts,function(obj){
            if(obj.status = status.success.status){
                callback(obj);
            }
        });
    },
    sendMailOfAct : function(opts,callback){
        opts.timestamp = Date.parse(new Date()) / 1000;
        opts.type = mailsType.ACT;
        console.info(opts);
        db.create(opts,function(obj){
            if(obj.status = status.success.status){
                callback(obj);
            }
        });
    }
};

module.exports = Handler;