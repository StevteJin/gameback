/**
 * Created by easy8in on 16/6/27.
 */
var Handler = function(){
};

var playerMgr = module.exports = Handler;
var CONSTS = require('./../consts/consts');
var async = require("async");
var reward = require('./../../conf/AarenaConfig.json');
var _ = require("underscore")._;
var playerDao = require('./../dao/playerDao');
var mailDao = require('./../dao/mailDao');
var lvLogDao = require('./../dao/lvLogDao');
var timeMgr = require('./timeMgr');
var arenaPlayer = require('./../../conf/arenaPlayer.json');
var arenaPlayerVN = require('./../../conf/arenaPlayerVN.json');
var arenaPlayerCN = require('./../../conf/arenaPlayerCN.json');
var language  = require("./../consts/language");

playerMgr.webPlayer = function(pid,callback){
    async.waterfall([
        function(next){//查询玩家信息
            var dao = new playerDao();
            var attrName = ["nickName","svr_combat","role","vip","vipExp","svr_createtimestamp","svr_savetimestamp","svrName"];
            dao.findPlayerFieldsById(pid,attrName,function(ots){
                var player = undefined;
                if(ots.status === 200){
                    player = ots.items[0];
                }
                next(null,player);
            });
        },function(player,next){
            var cpval =  0;
            if(player.hasOwnProperty("svr_combat")){
                cpval = player.svr_combat.combatPowerVal;
            }
            var dao = new playerDao();
            dao.playerCpvalRank(player.svrName,cpval,function(rk){
                player.crank = rk.cpvalRank;
                next(null,player);
            });
        }
    ],function(err,player){
        callback(player);
    });
};

playerMgr.bindEquipment = function(pid,eid,callback){
    var timestamp = timeMgr.getTimestamp();
    var bindEquipment = {"eid":eid,"timestamp":timestamp};
    var dao = new playerDao();
    dao.bindEquipment(pid,bindEquipment,function(code){
        //console.info("playerMgr:" + code);
        callback(code);
    });
};

playerMgr.upLv = function(pid,callback){
    var dao = new playerDao();
    dao.findPlayer(pid,function(r){
        // console.info(r);
        if(r.code === CONSTS.AVATAR.AVATAR_LIST_SUCCESS && r.list.length > 0 ){
            var player = r.list[0];
            // console.info(player);
            var lv = player.role.lv;
            var goal_lv = lv+1;

            //UC删档测试
            //    testUpLv(pid,goal_lv);
            //-------------

            var timestamp = timeMgr.getTimestamp();
            var upLvLog = {"pid":player._id+"","nickName":player.nickName,"lv":goal_lv,"timestamp":timestamp};
            var lDao = new lvLogDao();
            lDao.save(upLvLog,function(logs){
                callback({"lv":goal_lv,"timestamp":timestamp});
            });
        }
    });
};

//UC删档测试功能
function testUpLv(pid,lv){
    var gold = 1;
    var dms = 1;
    var propId = "3000,3001";
    var propCount = "";
    var isSend = false;
    if(lv < 40){
        if(lv % 5 == 0){
            gold = lv * 1000;
            dms = lv * 50;
            isSend = true;
        }
    }else{
        isSend = true;
        gold = lv * 1500;
        dms = lv * 100;
    }
    propCount = gold+","+dms;
    if(isSend){
        var mail = {"pid":pid + "","theme":"升级礼包","content":"","rewardList":propId,"count":propCount,"from":"GM"};
        var dao = new mailDao();
        dao.sendMailToPlayer(mail,function(mail){
        });
    }
}

playerMgr.checkEquipment = function(pid,eid,callback){
    var dao = new playerDao();
    dao.findPlayerFieldsById(pid,"svr_bindEquipment",function(ots){
        var player = undefined;
        if(ots.status === 200){
            player = ots.items[0];
        }
        var beid = player.svr_bindEquipment.eid;
        if(beid === eid){
            callback(undefined);
        }else{
            callback(player);
        }
    });
};
/*
 初始化竞技场其他玩家的排名
 */
playerMgr.arenaInitMain = function(callback){
    //var dao = new playerDao();
    //dao.initArena(function(ots){
    //    callback(ots);
    //});
    var player = arenaPlayer[0];
    callback(player);
};
/*
初始化竞技场僵尸号
 */
playerMgr.arenaInitPlayer = function(svrName,language){
    var playerList = undefined;
    if(language === 'CN'){
        playerList = arenaPlayerCN;
    }else{
        playerList = arenaPlayerVN;
    }
    var len = 1000;
    for(var i = 1 ; i <=len; i++){
        var inx = i - 1;
        var dao = new playerDao();
        var player = playerList[inx];
        var nickName = player.nickName;
        player.nickName = svrName + "-" + nickName;
        player.svrName = svrName;
        player.svr_arenaRank = i;
        dao.createArenaPlayer(player,function(ots){
            console.info(ots);
        });
    }
    console.info("arenaInitPlayer for end!");
};
/*
竞技场排名
 */
playerMgr.arenaRank = function(pid,svrName,min,max,callback){
    var dao = new playerDao();
    var rs={};
    dao.findPlayerFieldsById(pid,"svr_arenaRank",function(ots) {
        var player = undefined;
        if (ots.status === 200) {
            player = ots.items[0];
        }
        var prk = player.svr_arenaRank;
        if(prk === undefined || prk < 1){
            rs.currRank = 0;
        }else{
            rs.currRank = prk;
        }
        var query = { "svrName":svrName,"svr_arenaRank" : { $gte: min, $lte: max } };
        dao.findArenaRank(query,["nickName","uid","role","arenaCurrentMercanar","nMercanarList","currentMercanar","currentEquips","currentEquips2","currentFashion","isFashion","isEquip2","svr_arenaRank","svr_combat","svr_arenaLastRank"],function(ot){
            rs.rankList = ot.items;
            callback(rs);
        });
    });
};

playerMgr.arenaCustomPlayer = function(pid,custom,callback){
    var dao = new playerDao();
    dao.customPlayer(pid,custom,function(ots){
        callback(ots);
    });
};

playerMgr.pushArenaPlayer = function(opts,callback){
    var dao = new playerDao();
    var pid = opts.pid;
    async.waterfall([
        function(next){
            dao.findPlayerFieldsById(pid,["svrName","svr_arenaRank","svr_custom"],function(ots){
                var player = undefined;
                if(ots.status === 200){
                    player = ots.items[0];
                }
                next(null,player);
            });
        },function(player,next){
            var svr_arenaRank = player.svr_arenaRank;
            if(svr_arenaRank === undefined || svr_arenaRank < 1){
                dao.initArenaRank(pid,player.svrName,function(rank){
                    player.svr_arenaRank = rank.svr_arenaRank;
                    next(null,player);
                });
            }else{
                next(null,player);
            }
        },function(player,next){
            var svr_custom = player.svr_custom;
            var svr_arenaRank = player.svr_arenaRank;
            if(svr_custom === undefined || svr_custom.length < 1){
                var list = GetArrRandomNum(3,svr_arenaRank);
                var query = {"svrName":player.svrName,"svr_arenaRank" : {$in: list} };
                dao.findArenaPlayer(query,["nickName","uid","role","currentEquips","currentEquips2","currentFashion","isFashion","isEquip2","svr_arenaRank","svr_combat"],function(ots){
                    next(null,ots.items);
                });
            }else{
                var queryName = { "nickName" : {$in: svr_custom} };
                dao.findArenaPlayer(queryName,["nickName","uid","role","currentEquips","currentEquips2","currentFashion","isFashion","isEquip2","svr_arenaRank","svr_combat"],function(ots){
                    var rList = ots.items;
                    if(rList.length < 3){
                        var len = 3 - rList.length;
                        var list = GetArrRandomNum(len,svr_arenaRank);
                        var query = {"svrName":player.svrName,"svr_arenaRank" : {$in: list} };
                        dao.findArenaPlayer(query,["nickName","role","currentEquips","currentEquips2","currentFashion","isFashion","isEquip2","svr_arenaRank","svr_combat"],function(ots){
                            //rList.push(ots.items);
                            for(var i = 0 ; i<ots.items.length; i++){
                                rList.push(ots.items[i]);
                            }
                            next(null,rList);
                        });
                    }else{
                        next(null,rList);
                    }
                });
            }
        }
    ], function (err, result) {
        result.sort(function(a,b){
            return a.svr_arenaRank - b.svr_arenaRank;
        });
        callback(result);
    });
};

playerMgr.arenaPlayerRank = function(opts,callback){
    var dao = new playerDao();
    var pid = opts.pid;
    async.waterfall([
        function(next){
            dao.findPlayerFieldsById(pid,["svrName","svr_arenaRank"],function(ots){
                var player = undefined;
                if(ots.status === 200){
                    player = ots.items[0];
                }
                next(null,player);
            });
        },function(player,next){
            var svr_arenaRank = player.svr_arenaRank;
            if(svr_arenaRank === undefined || svr_arenaRank < 1){
                dao.initArenaRank(pid,player.svrName,function(rank){
                    player.svr_arenaRank = rank.svr_arenaRank;
                    next(null,player);
                });
            }else{
                next(null,player);
            }
        }
    ], function (err, result) {
        callback(result);
    });
};

/*
竞技推介玩家
 */
playerMgr.arenaRandomPlayer = function(opts,callback){
    var dao = new playerDao();
    var pid = opts.pid;
    dao.findPlayerFieldsById(pid,["svr_arenaRank","svr_custom"],function(ots){
        var player = undefined;
        if(ots.status === 200){
            player = ots.items[0];
        }
        var svr_custom = player.svr_custom;
        var prk = player.svr_arenaRank;
        var rdn = 1000;
        if(prk === undefined || prk < 1){
        }else{
            rdn = prk;
        }
        if(svr_custom === undefined || svr_custom.length < 1){
            var list = GetArrRandomNum(3,rdn);
            var query = { "svr_arenaRank" : {$in: list} };
            dao.findArenaPlayer(query,["nickName","role","currentEquips","currentEquips2","currentFashion","isFashion","isEquip2","svr_arenaRank","svr_combat"],function(ots){
                callback(ots.items);
            });
        }else{
            var queryName = { "nickName" : {$in: svr_custom} };
            dao.findArenaPlayer(queryName,["nickName","role","currentEquips","currentEquips2","currentFashion","isFashion","isEquip2","svr_arenaRank","svr_combat"],function(ots){
                var rList = ots.items;
                if(rList.length < 3){
                    var len = 3 - rList.length;
                    var list = GetArrRandomNum(len,rdn);
                    var query = { "svr_arenaRank" : {$in: list} };
                    dao.findArenaPlayer(query,["nickName","role","currentEquips","currentEquips2","currentFashion","isFashion","isEquip2","svr_arenaRank","svr_combat"],function(ots){
                        rList.push(ots.items);
                        callback(rList);
                    });
                }else{
                    callback(rList);
                }
            });
        }
    });
};
/*
score = win
score = lose
 */
playerMgr.arenaScore = function(pid,vsPid,score,callback){
    var timestmp = timeMgr.getTimestamp();
    async.waterfall([
        function(next){
            var dao = new playerDao();
            dao.findPlayerFieldsById(pid,["nickName","uid","role","currentEquips","currentEquips2","currentFashion","isFashion","isEquip2","svr_arenaLogs","svr_arenaRankLogs","svr_arenaAwardLogs","svr_arenaRank"],function(ots){
                var player = ots.items[0];
                next(null,player);
            });
        },
        function(player,next){
            var dao = new playerDao();
            dao.findPlayerFieldsById(vsPid,["nickName","uid","role","currentEquips","currentEquips2","currentFashion","isFashion","isEquip2","svr_arenaLogs","svr_arenaRank"],function(ots){
                var vsPlayer = ots.items[0];
                next(null,player,vsPlayer);
            });
        }
    ],function(err,player,vsPlayer){
        var arenaLog = {};
        var playerUpdatModel = {};
        var vsPlayerUpdateModel = {};
        var swop = 0;
        if(score == "win"){
            if(vsPlayer.svr_arenaRank < player.svr_arenaRank){
                var wr = vsPlayer.svr_arenaRank;
                var lr = player.svr_arenaRank;
                player.svr_arenaRank = wr;
                vsPlayer.svr_arenaRank = lr;
                playerUpdatModel.svr_arenaRank = wr;
                vsPlayerUpdateModel.svr_arenaRank = lr;
                swop = 1;
                var svr_arenaRankLogs = player.svr_arenaRankLogs;
                var isFirst = false;
                if(svr_arenaRankLogs == undefined){
                    isFirst = true;
                    var tmpArr = [];
                    tmpArr.push(wr);
                    playerUpdatModel.svr_arenaRankLogs = tmpArr;
                }else if(!_.contains(svr_arenaRankLogs, wr)){
                    isFirst = true;
                    svr_arenaRankLogs.push(wr);
                    playerUpdatModel.svr_arenaRankLogs = svr_arenaRankLogs;
                }
                if(isFirst){
                    awardPlayerToMail(pid,wr,lr - wr);
                }
            }
            var svr_arenaAwardLogs = player.svr_arenaAwardLogs;
            if(svr_arenaAwardLogs == undefined){
                svr_arenaAwardLogs = [];
            }
            var reward = awardPlayer(player.svr_arenaRank);
            reward.timestamp = timestmp;
            svr_arenaAwardLogs.push(reward);
            playerUpdatModel.svr_arenaAwardLogs = svr_arenaAwardLogs;
            arenaLog = {"attacker":parseLogsPlayer(player),"defense":parseLogsPlayer(vsPlayer),"winer":"attacker","swop":swop,"timestmp":timestmp};
        }else{
            arenaLog = {"attacker":parseLogsPlayer(player),"defense":parseLogsPlayer(vsPlayer),"winer":"defense","swop":swop,"timestmp":timestmp};
        }
        var plogs = player.svr_arenaLogs;
        var vlogs = vsPlayer.svr_arenaLogs;
        if(plogs == undefined){
            plogs = [];
        }
        if(vlogs == undefined){
            vlogs = [];
        }
        plogs.push(arenaLog);
        vlogs.push(arenaLog);

        if(plogs.length > 20){
            plogs.splice(0,plogs.length - 20);
        }
        if(vlogs.length > 20){
            vlogs.splice(0,vlogs.length - 20);
        }
        playerUpdatModel.svr_arenaLogs = plogs;
        vsPlayerUpdateModel.svr_arenaLogs = vlogs;
        //callback({"p":playerUpdatModel,"v":vsPlayerUpdateModel});
        var pd = new playerDao();
        pd.updateArenaPlayer(pid,playerUpdatModel,function(pots){

        });
        pd.updateArenaPlayer(vsPid,vsPlayerUpdateModel,function(vpots){

        });
        callback(arenaLog);
    });
};

playerMgr.isSettleArenaAward = function(callback){
    var date = new Date();
    var hours = date.getHours();
    var timestamp = timeMgr.getTimestampOfDate(date);
    var start = 0;
    if(hours > 21){
        start = timeMgr.getTodayTimestampOfhms("21:00:00");
    }else if(hours < 9){
        start = timeMgr.getTodayZeroTimestamp() - 10800;
    }
    var end = start + 43200;
    var settle = 0;
    if(timestamp > start && timestamp < end){
        settle = 1;
    }
    callback({"settle":settle});
};



playerMgr.arenaAward = function(pid){
    var rewardListStr = "";
    var countStr = "";
    var date = new Date();
    var hours = date.getHours();
    var timestamp = timeMgr.getTimestamp();
    var start = 0;
    var end = 0;
    if(hours >= 21){
        start = timeMgr.getTodayTimestampOfhms("21:00:00");
    }else if(hours < 9){
        start = timeMgr.getTodayZeroTimestamp() - 10800;
    }
    end = start + 43200;
    if(timestamp > start && timestamp < end){
        console.info("111");
        var dao = new playerDao();
        dao.findPlayerFieldsById(pid,["svr_arenaAwardLogs","svr_arenaAwardTimestamp","language"],function(ots){
            var player = ots.items[0];
            var awardTimestamp = player.svr_arenaAwardTimestamp;
            if(awardTimestamp == undefined){
                awardTimestamp = 0;
            }
            if(awardTimestamp > start && awardTimestamp < end){
                //callback({"rewardList":rewardListStr,"count":countStr});
            }else{
                console.info("222");
                var arenaAwardLogs = player.svr_arenaAwardLogs;
                if(arenaAwardLogs !=undefined && arenaAwardLogs.length > 0){
                    var map = {};
                    for(var i = 0; i < arenaAwardLogs.length ; i++) {
                        console.info("Where:"+i);
                        var tr = arenaAwardLogs[i];
                        var lingStart = start - 57600;
                        console.info(i+"次"+lingStart+"|"+start+"|"+tr.timestamp);
                        console.info(new Date(lingStart * 1000));
                        console.info(new Date(start * 1000));
                        console.info(new Date(tr.timestamp * 1000));
                        //var lingEnd = start;
                        if (tr.timestamp > lingStart && tr.timestamp < start) {
                            console.info("333");
                            if (tr.ID1 > 0 && tr.Number1 > 0) {
                                if (tr.ID1 in map) {
                                    var num1 = map[tr.ID1];
                                    map[tr.ID1] = num1 + parseInt(tr.Number1);
                                } else {
                                    map[tr.ID1] = parseInt(tr.Number1);
                                }
                            }
                            if (tr.ID2 > 0 && tr.Number2 > 0) {
                                if (tr.ID2 in map) {
                                    var num2 = map[tr.ID2];
                                    map[tr.ID2] = num2 + parseInt(tr.Number2);
                                } else {
                                    map[tr.ID2] = parseInt(tr.Number2);
                                }
                            }
                            if (tr.ID3 > 0 && tr.Number3 > 0) {
                                if (tr.ID3 in map) {
                                    var num3 = map[tr.ID3];
                                    map[tr.ID3] = num3 + parseInt(tr.Number3);
                                } else {
                                    map[tr.ID3] = parseInt(tr.Number3);
                                }
                            }
                            if (tr.ID4 > 0 && tr.Number4 > 0) {
                                if (tr.ID4 in map) {
                                    var num4 = map[tr.ID4];
                                    map[tr.ID4] = num4 + parseInt(tr.Number4);
                                } else {
                                    map[tr.ID4] = parseInt(tr.Number4);
                                }
                            }
                        }
                    }

                    for(var key in map){
                        rewardListStr += key + ",";
                        countStr += map[key] + ",";
                    }

                    if(rewardListStr.substring(rewardListStr.length-1,rewardListStr.length) === ','){
                        rewardListStr = rewardListStr.substring(0,rewardListStr.length - 1);
                    }
                    if(countStr.substring(countStr.length-1,countStr.length) === ','){
                        countStr = countStr.substring(0,countStr.length - 1);
                    }
                    console.info(rewardListStr + "|length:"+rewardListStr.length);
                    console.info(countStr + "|length:"+countStr.length);
                    if(rewardListStr.length > 0 && countStr.length > 0){
                        var newArr = _.filter(arenaAwardLogs, function(logs){
                            if(logs.timestamp > (end - 14400)){
                                return logs;
                            }
                        });
                        var updateModel = {"svr_arenaAwardLogs":newArr,"svr_arenaAwardTimestamp":timestamp};
                        var lage = "chinese";
                        if(player.language != undefined){
                            lage = player.language;
                        }
                        var lang = language[lage];
                        var mail = {"pid":pid + "","theme":lang.arenaTheme,"content":lang.arenaContent,"rewardList":rewardListStr,"count":countStr,"from":lang.fromArena};
                        console.info(mail);
                        /*
                        dao.updatePlayerById(pid,updateModel,function(code){
                            var mail = {"pid":pid + "","theme":lang.arenaTheme,"content":lang.arenaContent,"rewardList":rewardListStr,"count":countStr,"from":lang.fromArena};
                            var mDao = new mailDao();
                            mDao.sendMailToPlayer(mail,function(){
                            });
                        });
                        */
                    }
                }
            }
        });
    }
};

playerMgr.sendAwardArenaPlayer = function(callback){
    var dao = new playerDao();
    var query = {"svr_arenaRank":{$gte:1},"uid":{$ne:"arenaplayer"}};
    dao.findArenaRank(query,["nickName","role","svr_arenaRank","language"],function(ots) {
        var rs = ots.items;
        for(var i=0;i<rs.length;i++){
            var player = rs[i];
            var updatePlayerModel = {"svr_arenaLastRank":player.svr_arenaRank};
            dao.updatePlayerById(player._id+"",updatePlayerModel,function(code){
            });
            var lage = "chinese";
            if(player.language != undefined){
                lage = player.language;
            }
            var lang = language[lage];
            var award = awardPlayerMailStr(player.svr_arenaRank,player.role);
            var mail = {"pid":player._id + "","theme":lang.arenaTheme,"content":lang.arenaContent,"rewardList":award.rewardList,"count":award.count,"from":lang.fromArena};
            console.info("Num:"+i+"|player:"+player);
	    var mDao = new mailDao();
            mDao.sendMailToPlayer(mail,function(){
            });
        }
        callback("end");
    });
};

playerMgr.realArenaAward = function(pid,callback){
    var rs = {"success":0};
    var date = new Date();
    var hours = date.getHours();
    var timestamp = timeMgr.getTimestampOfDate(date);
    var start = 0;
    if(hours > 21){
        start = timeMgr.getTodayTimestampOfhms("21:00:00");
    }else if(hours < 9){
        start = timeMgr.getTodayZeroTimestamp() - 10800;
    }
    var end = start + 43200;
    if(timestamp > start && timestamp < end){
    }
    var dao = new playerDao();
    dao.findPlayerFieldsById(pid,["svr_arenaAwardLogs","svr_arenaAwardTimestamp"],function(ots){
        var player = ots.items[0];
        var awardTimestamp = player.svr_arenaAwardTimestamp;
        if(awardTimestamp == undefined){
            awardTimestamp = 0;
        }
        if(awardTimestamp > start && awardTimestamp < end){
            callback(rs);
        }else{
            var arenaAwardLogs = player.svr_arenaAwardLogs;
            if(arenaAwardLogs = undefined || arenaAwardLogs.length < 0){
                callback(rs);
            }else{
                var newArr = _.filter(arenaAwardLogs, function(logs){
                        if(logs.timestamp > (end - 14400)){
                            return logs;
                        }
                    });
                var updateModel = {"svr_arenaAwardLogs":newArr,"svr_arenaAwardTimestamp":timestamp};
                dao.updatePlayerById(pid,updateModel,function(code){
                    rs.success = 1;
                    callback(rs);
                });
            }
        }
    });
};

playerMgr.testAwardPlayerToMail = function(pid,rankNum,cha){
    console.info(awardPlayerToMail(pid,rankNum,cha));
    //return awardPlayer(rankNum);
};



awardPlayerToMail = function(pid,rankNum,cha){
    var reward = awardPlayer(rankNum);
    var rewardList = "" + reward.ID5;
    var bshu = parseFloat(reward.Number5).toFixed(3);
    var count = parseInt(cha * bshu);
    if(count < 1){
        count = 1;
    }
    var pdao = new playerDao();
    pdao.findPlayerFieldsById(pid,"language",function(ots) {
        var player = ots.items[0];
        var lage = "chinese";
        if(player.language != undefined){
            lage = player.language;
        }
        var lang = language[lage];
        var mail = {"pid":pid + "","theme":lang.arenaTheme,"content":lang.arenaContent1 + rankNum,"rewardList":rewardList,"count":count,"from":lang.fromArena};
        //return mail;
        var dao = new mailDao();
        dao.sendMailToPlayer(mail,function(){
        });
    });
};

var awardPlayer = function(num){
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
    return r[0];
};

var awardPlayerMailStr = function(num,role){
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

playerMgr.arenaPlayerLogs = function(pid,callback){
    var dao = new playerDao();
    dao.findPlayerFieldsById(pid,["svr_arenaLogs"],function(ots){
        var player = ots.items[0];
        var alogs = player.svr_arenaLogs;
        if(alogs == undefined){
            alogs = [];
        }
        callback(alogs);
    });
};

function parseLogsPlayer(player){
    var tmpPlayer = {};
    tmpPlayer._id = player._id + "";
    tmpPlayer.uid = player.uid;
    tmpPlayer.role = player.role;
    tmpPlayer.nickName=player.nickName;
    tmpPlayer.currentEquips=player.currentEquips;
    tmpPlayer.currentEquips2=player.currentEquips2;
    tmpPlayer.currentFashion=player.currentFashion;
    tmpPlayer.isFashion=player.isFashion;
    tmpPlayer.isEquip2=player.isEquip2;
    //tmpPlayer.svr_arenaLogs=player.nickName;
    tmpPlayer.svr_arenaRank=player.svr_arenaRank;
    return tmpPlayer;
}

/*
竞技场胜利
 */
playerMgr.arenaWiner = function(pid,winPid,losePid,callback){
    //var winPlayer = {};
    //var losePlayer = {};
    var timestmp = timeMgr.getTimestamp();
    async.waterfall([
            function(next){
                var dao = new playerDao();
                //console.info(winPid);
                dao.findPlayerFieldsById(winPid,["svr_arenaLogs","svr_arenaRank"],function(ots){
                    var winPlayer = ots.items[0];
                    next(null,winPlayer);
                });
            },
            function(winPlayer,next){
                var dao = new playerDao();
                dao.findPlayerFieldsById(losePid,["svr_arenaLogs","svr_arenaRank"],function(ots){
                    //console.info(ots);
                    var losePlayer = ots.items[0];
                    next(null,winPlayer,losePlayer);
                });
            },function(winPlayer,losePlayer,next){
                var lgs = {"winPlayer":winPlayer,"losePlayer":losePlayer};

                next(null,winPlayer,losePlayer);
            }
        ],
        function(err,winPlayer,losePlayer){
            var result = {"winPlayer":winPlayer,"losePlayer":losePlayer};
            callback(result);
            /*
            var wr = winPlayer.svr_arenaRank;
            var lr = losePlayer.svr_arenaRank;
            var tmp = wr;
            wr = lr;
            lr = tmp;
            var dao = new playerDao();
            dao.updateArenaRank(winPid,wr);
            dao.updateArenaRank(losePid,lr);
            */
        });
};

playerMgr.playerByName = function(nickName,callback){
    var dao = new playerDao();
    dao.findPlayerByName(nickName,function(ots){
        callback(ots);
    });
};

playerMgr.playerById = function(pid,callback){
    var dao = new playerDao();
    dao.findPlayerById(pid,function(ots){
        //var res = {"nickName":ots.items[0].nickName};
        //callback(res);
        callback(ots.items[0]);
    });
};

function GetRandomNum(Min,Max) {
    return parseInt(Math.random()*(Max - Min + 1) + Min);
}

playerMgr.GetArrNum = function(len,wid){
    return GetArrRandomNum(len,wid);
};

function GetArrRandomNum(len,wid){
    var Arr = [];
    var inx = 0;
    var start = 1;
    var end = wid;
    if(wid > 10000){
        start = wid - 1000;
        // start = 100;
    }else if(wid > 1000){
        start = wid - 500;
        end = wid - 200;
    }else if(wid > 500){
        start = wid - 200;
        end = wid - 50;
    }else if(wid > 100) {
        start = wid - 100;
        end = wid - 25;
    }else if(wid > 50){
        start = wid - 50;
        end = wid - 10;
    }else if(wid > 3){
        //var bnum = parseInt(wid /10);
        //var tmp = (bnum -2) > 0 ? bnum - 2 : 1;
        //var ar = tmp * 6;
        start = wid - 6 > 0 ? wid - 6 : 1;
        end = wid;
    }else{
        start = 1;
        end = 4;
    }
    //console.info(start + "|" + end);
    while(true){
        var rnum = GetRandomNum(start,end);
        if(!_.contains(Arr, rnum) && rnum != wid){
            Arr.push(rnum);
            ++inx;
        }
        if(inx > len - 1){
            break;
        }
    }
    Arr.sort(function(a,b){
        return a-b});
    return Arr;
}
