var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('player');
var timeMgr = require('./../message/timeMgr');
//var initPlayer = require('./../../conf/initPlayer.json');
var initPlayer = require('./../../conf/newInitPlayer.json');
var initNvPlayer = require('./../../conf/nvInitPlayer.json');
var baseAttr = {
    uid : "uid",
    svrName : "svrName",
    save:"svr_savetimestamp",//存档时间戳
    create : "svr_createtimestamp",//创建时间戳
    mailTimestamp : "svr_mailTimestamp",//邮件时间戳
    slTimestamp : "svr_slTimestamp",//进入游戏时间戳
    slCount : "svr_slCount",//连续进入游戏的天数
    frTimestamp : "svr_frTimestamp",//首次充值时间戳 first Recharge timestamp
    frList : "svr_frList",//已经购买的列表
    combat : "svr_combat",//属性战力
    closeTimestamp : "svr_closeTimestamp",//封禁时间
    arenaRank : "svr_arenaRank",//竞技场排名
    arenaLogs : "svr_arenaLogs",
    arenaRankLogs : "svr_arenaRankLogs",
    arenaLastRank : "svr_arenaLastRank"
};

var Handler = function(){
};

Handler.prototype = {
    create : function(opts, callback) {
        var uid = opts.uid || "";
        var playerType = opts.playerType;
        var nickName = opts.nickName;
        var svrName = opts.svrName;
        var timestamp = Date.parse(new Date()) / 1000;

        var initPDate = undefined;
        if(playerType === "soldier"){
            initPDate = initPlayer;
        }else if(playerType === "mage"){
            initPDate = initNvPlayer;
        }else {
            callback({"code": CONSTS.AVATAR.AVATAR_CREATE_FAIL});
            return;
        }

        var player = _.clone(initPDate);
        player[baseAttr.uid] = uid;
        player[baseAttr.svrName] = svrName;
        player[baseAttr.create] = timestamp;
        player[baseAttr.save] = timestamp;
        player[baseAttr.mailTimestamp] = timestamp;
        player[baseAttr.slTimestamp] = 0;
        player[baseAttr.slCount] = 0;
        player[baseAttr.frTimestamp] = 0;
        player[baseAttr.frList] = [];
        player[baseAttr.closeTimestamp] = 0;
        player[baseAttr.arenaRank] = 0;
        player[baseAttr.arenaLogs] = [];
        player[baseAttr.arenaRankLogs] = [];
        player[baseAttr.arenaLastRank] = 0;
        player.playerType = playerType;
        player.nickName = nickName;

        var cquery = {"nickName":nickName};
        db.read(cquery,function(item){
            if (item.status === status.success.status) {
                if(item.items.length > 0){
                    callback({"code": CONSTS.AVATAR.AVATAR_CREATE_FAIL});
                }else{
                    db.create(player, function (ots) {
                        if (ots.status === status.success.status) {
                            callback({"code": CONSTS.AVATAR.AVATAR_CREATE_SUCCESS, "player": ots.ops[0]});
                        } else {
                            callback({"code": CONSTS.AVATAR.AVATAR_CREATE_FAIL});
                        }
                    });
                }
            } else {
                callback({"code": CONSTS.AVATAR.AVATAR_CREATE_FAIL});
            }
        });
    },
    loadPayerList : function(opts, callback){
        var uid = opts.uid;
        var svrName = opts.svrName;
        var query = {"uid" : uid,"svrName":svrName};
        db.read(query,function(item){
            if (item.status === status.success.status) {
                callback({"code": CONSTS.AVATAR.AVATAR_LIST_SUCCESS, "list": item.items});
            } else {
                callback({"code": CONSTS.AVATAR.AVATAR_LIST_FAIL});
            }
        });
    },
    findPlayer : function(pid,callback){
        db.findById(pid,function(item){
            if (item.status === status.success.status) {
                callback({"code": CONSTS.AVATAR.AVATAR_LIST_SUCCESS, "list": item.items});
            } else {
                callback({"code": CONSTS.AVATAR.AVATAR_LIST_FAIL});
            }
        });
    },
    closePlayer : function(pid,callback){
        db.updateById(pid,{"svr_closeTimestamp":timeMgr.getTimestamp()},function(code){
            callback(code);
        });
    },
    updatePlayerById : function(pid,updateModel,callback){
        db.updateById(pid,updateModel,function(code){
            callback(code);
        });
    },
    unclosePlayer : function(pid,callback){
        db.updateById(pid,{"svr_closeTimestamp":0},function(code){
            callback(code);
        });
    },
    closePlayerList : function(callback){
        db.read({"svr_closeTimestamp":{$gt:0}},function(ots){
            callback(ots);
        });
    },
    findPvalRank : function(query,attrName,callback){
       db.findFieldsByQuery(query,attrName,{"svr_combat.combatPowerVal":-1},0,20,function(item){
            callback(item);
       });
    },
    findWebPvalRank : function(query,attrName,callback){
       db.findFieldsByQuery(query,attrName,{"svr_combat.combatPowerVal":-1},0,100,function(item){
            callback(item);
       });
    },
    firstRecharge : function(pid){
        db.updateById(pid,{"svr_frTimestamp":timeMgr.getTimestamp()},function(code){
        });
    },
    firstRechargeList : function (pid,arr){
        db.updateById(pid,{"svr_frList":arr},function(code){
        });
    },
    bindEquipment : function(pid,updateModel,callback){
        db.updateById(pid,{"svr_bindEquipment":updateModel},function(code){
            //console.info("bindEquipment:" + code);
            callback(code);
        });
    },
    savePlayer : function(opts, callback) {
        var timestamp = timeMgr.getTimestamp();
        var updateModel = _.omit(opts.player, "svr_createtimestamp");
        
        updateModel[baseAttr.save]=timestamp;

        db.updateById(opts.pid,updateModel,function(code){
            //console.info(code);
            var res = CONSTS.AVATAR.AVATAR_SAVE_FAIL;
            if(code.status === status.success.status){
                res = CONSTS.AVATAR.AVATAR_SAVE_SUCCESS
            }
            callback({"code": res});
        });
    },
    loadPayer : function(opts, callback) {
        db.findById(opts.pid,function(obj){
            if(obj.status === status.success.status){
                callback({"code": CONSTS.AVATAR.AVATAR_LOAD_SUCCESS, "player": obj.items});
            }else{
                callback({"code": CONSTS.AVATAR.AVATAR_SAVE_FAIL});
            }
        });
    },
    existPayer : function(opts, callback) {
        db.read({"nickName":opts.nickName},function(obj){
            if(obj.status === status.success.status && obj.items.length === 0 ){
                callback({"code": CONSTS.AVATAR.AVATAR_NICKNAME_NOT_EXIST});
            }else{
                callback({"code": CONSTS.AVATAR.AVATAR_NICKNAME_EXIST});
            }
        });
    },
    randomPlayer : function(opts,callback){
        var query = {"svrName":opts.svrName,"uid" : {$ne : opts.uid}};
        db.count(query,function(r){
            var index = GetRandomNum(0, r);
            var inx = index > 0 ? index -1 : index;
            db.readRandom(query,inx,1,function(ots){
                callback(ots.items[0]);
            });
        });
    },
    getMailTimestamp : function(pid,callback){
        db.findById(pid,function(obj){
            if(obj.status === status.success.status){
                if(obj.items.length > 0){
                    callback({"mailTimestamp":obj.items[0][baseAttr.mailTimestamp]});
                }else{
                    callback({"mailTimestamp":Date.parse(new Date()) / 1000});
                }
            }
        });
    },
    updateCombat : function(pid,combat){
        var updateModel = {};
        updateModel[baseAttr.combat] = combat;
        db.updateById(pid,updateModel,function(obj){

        });
    },
    updateArenaRank:function(pid,rank){
        db.updateById(pid,{"svr_arenaRank":rank},function(obj){
        });
    },
    updateArenaPlayer:function(pid,updateModel,callback){
        db.updateById(pid,updateModel,function(obj){
            callback(obj);
        });
    },
    updateMailTimestamp : function(pid,mailTimestamp){
        var updateModel = {};
        updateModel[baseAttr.mailTimestamp] = mailTimestamp;
        db.updateById(pid,updateModel,function(obj){

        });
    },
    regexFindPlayer : function(txt,callback){
        var query = {"nickName":{$regex:txt}};
        db.read(query,function(item){
            callback(item);
        });
    },
    regexFindPlayerFieldsByQuery: function(txt,attrName,callback){
        var query = {"nickName":{$regex:txt}};
        db.findFieldsQuery(query,attrName,function(item){
            callback(item);
        });
    },
    findPlayerFieldsById: function(pid,attrName,callback){
        db.findFieldsById(pid,attrName,function(ots){
            callback(ots);
        });
    },
    findPlayerFieldsByQuery: function(query,attrName,callback){
        db.findFieldsQuery(query,attrName,function(ots){
            callback(ots);
        });
    },
    newCount : function(callback){
        var query = {"svr_createtimestamp":{ $gte: timeMgr.getTodayZeroTimestamp() }};
        db.count(query,function(r){
            callback(r);
        });
    },
    playerCount : function(callback){
        db.count({"uid":{$ne:"arenaplayer"}},function(r){
            callback(r);
        });
    },
    playerRank : function(svrName,lv,callback){
        var query = {"svrName":svrName,"role.lv":{$gt:lv}};
        db.count(query,function(r){
            var rk = parseInt(r) + 1;
            callback({"rank": rk});
        });
    },
    playerCpvalRank : function(svrName,cpval,callback){
        var query = {"svrName":svrName,"svr_combat.combatPowerVal":{ $gt: cpval },"svr_closeTimestamp":{$lte:0}};
        db.count(query,function(r){
            var rk = parseInt(r) + 1;
            callback({"cpvalRank": rk});
        });
    },
    wUsersLeave : function(callback){
        var timestamp = timeMgr.getTodayZeroTimestamp() - 604800;
        var query = {"uid":{$ne:"arenaplayer"},"svr_savetimestamp":{ $lt: timestamp }};
        db.count(query,function(r){
            callback(r);
        });
    },
    wUsersLeaveGroupLv : function(callback){
        var timestamp = timeMgr.getTodayZeroTimestamp() - 604800;
        var query = {"uid":{$ne:"arenaplayer"},"svr_savetimestamp":{ $lt: timestamp }};
        db.gourpCount("role.lv",query,function(r){
            callback(r);
        });
    },
    twUsersLeave : function(callback){
        var timestamp = timeMgr.getTodayZeroTimestamp() - 1209600;
        var query = {"uid":{$ne:"arenaplayer"},"svr_savetimestamp":{ $lt: timestamp }};
        db.count(query,function(r){
            callback(r);
        });
    },
    twUsersLeaveGroupLv : function(callback){
        var timestamp = timeMgr.getTodayZeroTimestamp() - 1209600;
        var query = {"uid":{$ne:"arenaplayer"},"svr_savetimestamp":{ $lt: timestamp }};
        db.gourpCount("role.lv",query,function(r){
            callback(r);
        });
    },
    mUsersLeave : function(callback){
        var timestamp = timeMgr.getTodayZeroTimestamp() - 2592000;
        var query = {"uid":{$ne:"arenaplayer"},"svr_savetimestamp":{ $lt: timestamp }};
        db.count(query,function(r){
            callback(r);
        });
    },
    mUsersLeaveGroupLv : function(callback){
        var timestamp = timeMgr.getTodayZeroTimestamp() - 2592000;
        var query = {"uid":{$ne:"arenaplayer"},"svr_savetimestamp":{ $lt: timestamp }};
        db.gourpCount("role.lv",query,function(r){
            callback(r);
        });
    },
    newFirstRechargePlayer : function(callback){
        var timestamp = timeMgr.getTodayZeroTimestamp();
        //console.info(timestamp);
        var query = {"svr_frTimestamp":{ $gt: timestamp }};
        db.count(query,function(r){
            callback(r);
        });
    },
    initArena : function(callback){
        db.update({"svr_arenaRank":{$gt:0}},{"svr_arenaRank":-1},function(ots){
            callback(ots);
        });
    },
    createArenaPlayer : function(player, callback) {
        db.create(player, function (ots) {
            if (ots.status === status.success.status) {
                callback("create Arena Player [" + player.nickName + "] Successfully!");
            } else {
                callback("create Arena Player [" + player.nickName + "] Fail!");
            }
        });
    },
    findArenaRank : function(query,attrName,callback){
        db.findFieldsQuerySortOfCount(query,attrName,{"svr_arenaRank": 1},300,function(item){
            callback(item);
        });
    },
    findArenaPlayer : function(query,attrName,callback){
        db.findFieldsQuery(query,attrName,function(item){
            callback(item);
        });
    },
    findAllPlayer:function(query,attrName,callback){
       db.findFieldsQuery(query,attrName,function(item){
            callback(item);
        });
    },
    findPlayerById : function(pid,callback){
        db.findById(pid,function(ots){
           callback(ots);
        });
    },
    findPlayerByName : function(nickName,callback){
        //db.findById(nickName,function(ots){
        //    callback(ots);
        //});
        var query = {"nickName":nickName};
        db.read(query,function(ots){
            if(ots.status === 200){
                callback(ots.items[0]);
            }else{
                callback({});
            }
        });
    },
    customPlayer : function(pid,custom,callback){
        var updateModel = {"svr_custom":custom};
        db.updateById(pid,updateModel,function(ots){
            callback(ots);
        });
    },
    initArenaRank : function(pid,svrName,callback){
        var query = {"svrName":svrName,"svr_arenaRank":{$gt:0}};
        var sort = {"svr_arenaRank":-1};
        db.findFieldsByQuery(query,"svr_arenaRank",sort,0,1,function(ots){
            var rank = 0;
            if(undefined != ots.items[0].svr_arenaRank){
                rank = ots.items[0].svr_arenaRank;
            }
            rank +=1;
            db.updateById(pid,{"svr_arenaRank":rank},function(upo){
                //console.info(upo);
                callback({"svr_arenaRank":rank});
            })
        });
    },
    aggregate : function(query,callback){
        //var query =[];
        db.aggregate(query,function(ots){
            callback(ots);
        });
    },
    cleanAranaRank : function(svrName,callback){
        var updateModel = {"svr_arenaRank":0,"svr_arenaLogs":[],"svr_arenaRankLogs":[],"svr_arenaLastRank":0};
        db.update({"svrName":svrName},updateModel,function(rs){
            callback(rs);
        });
    }
};

function GetRandomNum(Min,Max) {
    return parseInt(Math.random()*(Max - Min + 1) + Min);
}

module.exports = Handler;
