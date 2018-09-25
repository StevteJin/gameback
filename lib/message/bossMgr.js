/**
 * Created by easy8in on 16/4/20.
 */

var redis = require('redis');
var redisConf = require('./../../conf/redis.json');
var reward = require('./../../conf/BossAwardConfig.json');
var client = redis.createClient(redisConf);
var consts = require("./../consts/consts");
var confMgr = require("./confMgr");
var timeMgr = require("./timeMgr");
var svrMgr = require("./svrMgr");
var mailDao = require("./../dao/mailDao");
var playerDao = require("./../dao/playerDao");
var async = require("async");
var _ = require("underscore")._;
var language  = require("./../consts/language");

client.on('ready', function (res) {
    console.log('connector redis ready');
});

client.on('error', function (err) {
    console.log('error event - ' + client.host + ':' + client.port + ' - ' + err);
});

var Handler = function(){
};

var bossMgr = module.exports = Handler;

bossMgr.initBoss = function(time,hp,callback){
    confMgr.getTodayBossConfg(function(bconfs){
        //console.info(bconfs);
        for(var i = 0 ; i<bconfs.length;i++){
            //console.info(bconfs[i]);
            newBoss(bconfs[i]);
        }
        callback("end");
    });
};

function newBoss(bconf){
    var bossInfo = {};
    var svrName = bconf.svrName;
    svrMgr.findSvrIdByName(svrName,function(ots){
        console.info(ots);
        var svrId = ots._id;
        var dateStr = getYMD(new Date());
        bossInfo.id = parseInt(bconf.mid);
        var startTime = dateStr + " " + bconf.StartTime + ":00";
        bossInfo.startTime = Date.parse(new Date(startTime)) / 1000;
        bossInfo.lv = parseInt(bconf.Lv);
        bossInfo.hp = bconf.HP;
        bossInfo.chp = bconf.HP;

        client.set(bossKey(svrId),JSON.stringify(bossInfo));
        client.del(scoreKey(svrId));
    });
}

function bossKey(svrId){
    return "BOSS_"+svrId;
}

function scoreKey(svrId){
    return "SCORE_"+svrId;
}



bossMgr.reqBossInfo = function(svrId,callback){
    client.get(bossKey(svrId),function(err,res){
        var boss = JSON.parse(res);
        var timestamp = Date.parse(new Date()) / 1000;
        var Countdown = 0;
        if(timestamp < boss.startTime){
            Countdown = boss.startTime - timestamp;
        }
        boss.Countdown = Countdown;
        callback(boss);
    });
};

//http://127.0.0.1:3030/tests/testAttackBoss?pid=123&nickName=test&attack=10
bossMgr.attackBoss = function(opts,callback){
    var timestamp = Date.parse(new Date()) / 1000;
    var bkey = bossKey(opts.svrId);
    var skey = scoreKey(opts.svrId);
    client.get(bkey,function(err,res){
        if(err){
            console.log('Error:'+err);
        }else{
            var boss = JSON.parse(res);
            if(boss){
                if(boss.startTime < timestamp && boss.chp > 0 && opts.attack > 0){
                    boss.chp = (boss.chp - opts.attack) > 0 ? (boss.chp - opts.attack) : 0 ;
                    client.set(bkey,JSON.stringify(boss));
                    //client.zadd("SCORE",[opts.attack, opts.pid + ":" + opts.nickName]);
                    client.zincrby(skey,[opts.attack, opts.pid + ":" + opts.nickName]);

                    if(boss.chp === 0){
                        //killer
                        boss.killer = {"pid":opts.pid,"nickName":opts.nickName};
                        client.set(bkey,JSON.stringify(boss));
                        //发放奖励
                        awardBOSSToMail(skey);
                    }
                    callback(boss);
                }else{
                    callback(boss);
                }
            }else{
                //no boss
                callback({"code":consts.BOSS.NOT_BOSS});
            }
        }
    });
};

bossMgr.ScorePlan = function(opts,callback){
    var bkey = bossKey(opts.svrId);
    client.get(bkey,function(err,res){
        if(err){
            console.log('Error:'+err);
        }else{
            var boss = JSON.parse(res);
            if(boss){
                score(opts,function(scorePlan){
                    callback(scorePlan);
                });
            }
        }
    });
};

bossMgr.ScoreRank = function(opts,callback){
    scoreRank(opts,function(scoreRank){
        callback(scoreRank);
    });
};

bossMgr.RewardList = function(callback){
    var rl = [];
    var role = {"id":10001};
    for(var i = 0 ; i < reward.length; i++){
        rl.push(formatReward(reward[i],role));
    }
    callback(rl);
};

function getYMD(date){
    var y = date.getFullYear();
    var m = date.getMonth() < 10 ? '0' + (date.getMonth()+1) : (date.getMonth()+1);
    var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return y + '-' + m + '-' + d;
}

var score = function(opts,callbackt){
    var scorePlan = {};
    var pr = opts.pid + ":" + opts.nickName;//玩家成员key
    var skey = scoreKey(opts.svrId);
    async.parallel([
            function(callback){//获取前三名玩家
                var arr = [];
                client.zrevrange(skey,0,2,"WITHSCORES",function(err,res){
                    var player = {};
                    var num = 0 ;
                    for(var i = 0 ; i < res.length; i++){
                        if( (i+1) % 2 === 0 ){
                            player.attack = res[i];
                            player.num = num;
                            var p = _.extend({}, player);
                            arr.push(p);
                        }else{
                            //arr.push({"nickName":keys[1],"Num":i+1});
                            //console.info(res[i]);
                            var keys = res[i].split(':');
                            player.nickName = keys[1];
                            ++num;
                        }
                    }
                    scorePlan.px = arr;
                    callback(null);
                });
            },
            function(callback){//获取自己的排名
                client.zrevrank(skey,pr,function(err,res){
                    var num = res + 1;
                    scorePlan.cNum = num;
                    var pdao = new playerDao();
                    pdao.findPlayerFieldsById(opts.pid,["role","language"],function(ots) {
                        var player = ots.items[0];
                        var reward = awardPlayer(num,player.role);
                        scorePlan.reward = reward;
                        callback(null);
                    });
                });
            },
            function(callback){//获取自己的总伤害
                client.zscore(skey,pr,function(err,res){
                    scorePlan.attack = res;
                    callback(null);
                });
            }
        ],
        function(err){
            callbackt(scorePlan);
        });
};

var scoreRank = function(opts,callbackt){
    var scoreRank = {};
    var pr = opts.pid + ":" + opts.nickName;
    var skey = scoreKey(opts.svrId);
    async.parallel([
            function(callback){//获取前20名玩家
                var arr = [];
                var player = {};
                client.zrevrange(skey,0,19,"WITHSCORES",function(err,res){
                    for(var i = 0 ; i < res.length; i++){
                        if( (i+1) % 2 === 0 ){
                            player.attack = res[i];
                            var p = _.extend({}, player);
                            arr.push(p);
                        }else{
                            var keys = res[i].split(':');
                            //var pid = keys[0];
                            player.pid = keys[0];
                        }
                    }
                    scoreRank.list = arr;
                    callback(null);
                });
            },function(callback){//获取自己的排名
                client.zrevrank(skey,pr,function(err,res){
                    //var num = res + 1;
                    //var reward = awardPlayer(num);
                    //console.info(res);
                    var num = 0;
                    if(null != res){
                        num = res + 1;
                    }
                    scoreRank.cNum = num;
                    //scorePlan.reward = reward;
                    callback(null);
                });
            },
            function(callback){//获取自己的总伤害
                client.zscore(skey,pr,function(err,res){
                    var attack = 0;
                    if(null != res){
                        attack = res;
                    }
                    scoreRank.attack = res;
                    callback(null);
                });
            }
        ],
        function(err){
            var rank = {"attack":scoreRank.attack,"crank":scoreRank.cNum};
            var rks = [];
            async.eachSeries(scoreRank.list, function(item, next) {
                var pid = item.pid;
                var attack = item.attack;
                var dao = new playerDao();
                dao.findPlayerFieldsById(pid,["nickName","role","nMercanarList","currentMercanar","currentEquips","currentEquips2","isEquip2","currentFashion","isFashion","svr_combat"],function(ots){
                    var player = ots.items[0];
                    player.attack = attack;
                    rks.push(player);
                    next(null,item.pid);
                });
            }, function(err) {
                //console.info("123");
                rank.rankList = rks;
                callbackt(rank);
            });
            //console.info(rks.length);
        });
};

function rankPlayer (pid,sh){
    async.waterfall([
        function(callback){
            callback(null, 'one', 'two');
        }
    ], function (err, result) {
        return result;
    });
}

awardBOSSToMail =function(scoreKey){
    client.zrevrange(scoreKey,0,-1,"WITHSCORES",function(err,res){
        var num = 0;
        for(var i = 0 ; i < res.length; i++){
            if( (i+1) % 2 === 0 ){
            }else{
                var keys = res[i].split(':');
                var pid = keys[0];
                num = num +1;
                bossMail2Player(pid,num);
            }
        }
    });
}

bossMail2Player = function(pid,num){
    var pdao = new playerDao();
    pdao.findPlayerFieldsById(pid,["role","nickName","language"],function(ots) {
        var player = ots.items[0];
        var lage = "chinese";
        if(player.language != undefined){
            lage = player.language;
        }
        var lang = language[lage];
        var reward = awardPlayer(num,player.role);
        var mail = {"pid":player._id + "","theme":lang.bossTheme,"content":lang.bossContent,"rewardList":reward.rewardList,"count":reward.count,"from":lang.fromBoss};
        console.info("num:"+num);
        console.info(player);
        console.info(mail);
        var dao = new mailDao();
        dao.sendMailToPlayer(mail,function(){
        });
    });
}
/*
awardBOSSToMail = function(scoreKey){
    client.zrevrange(scoreKey,0,-1,"WITHSCORES",function(err,res){
        var num = 0 ;
        var player = {};
        console.info(res);
        for(var i = 0 ; i < res.length; i++){
            console.info(i);
            if( (i+1) % 2 === 0 ){
                player.attack = res[i];
                player.num = num;
                var p = _.extend({}, player);
            }else{
                var keys = res[i].split(':');
                player.pid = keys[0];
                player.nickName = keys[1];
                ++num;
                var pid = player.pid;
                var pdao = new playerDao();
                pdao.findPlayerFieldsById(pid,["role","nickName","language"],function(ots) {
                    var player = ots.items[0];
                    var lage = "chinese";
                    if(player.language != undefined){
                        lage = player.language;
                    }
                    var lang = language[lage];
                    var reward = awardPlayer(num,player.role);
                    var mail = {"pid":pid + "","theme":lang.bossTheme,"content":lang.bossContent,"rewardList":reward.rewardList,"count":reward.count,"from":lang.fromBoss};
                    console.info("num:"+num);
                    console.info(player);
                    var dao = new mailDao();
                    dao.sendMailToPlayer(mail,function(){
                    });
                });
            }
        }
    });
};
*/

var awardPlayer = function(num,role){
    var r =undefined;
    var eMax = reward[reward.length -1];
    if(num >= eMax.Min){
        r = [eMax];
    }else{
        r = _.filter(reward, function(rwd){
            if(rwd.Max >= num && num >= rwd.Min){
                return rwd;
            }
        });
    }
    return formatReward(r[0],role);
};

function formatReward(tr,role){
    var rs = {"Name":tr._id,"rewardList":"","count":""};
    var rewardListStr = "";
    var countStr = "";
    if(tr.ID1 > 0 && tr.Number1 > 0){
        if(role.id === 10002){
            rewardListStr += (tr.ID1 + 78) + ",";    
        }else{
            rewardListStr += tr.ID1 + ",";
        }
        countStr += tr.Number1 + ",";
    }
    if(tr.ID2 > 0 && tr.Number2 > 0){
        rewardListStr += tr.ID2 + ",";
        countStr += tr.Number2 + ",";
    }
    if(tr.ID3 > 0 && tr.Number3 > 0){
        rewardListStr += tr.ID3 + ",";
        countStr += tr.Number3 + ",";
    }
    if(tr.ID4 > 0 && tr.Number4 > 0){
        rewardListStr += tr.ID4 + ",";
        countStr += tr.Number4 + ",";
    }

    if(rewardListStr.substring(rewardListStr.length-1,rewardListStr.length) === ','){
        rewardListStr = rewardListStr.substring(0,rewardListStr.length - 1);
    }
    if(countStr.substring(countStr.length-1,countStr.length) === ','){
        countStr = countStr.substring(0,countStr.length - 1);
    }

    rs.rewardList = rewardListStr;
    rs.count = countStr;

    return rs;
}
