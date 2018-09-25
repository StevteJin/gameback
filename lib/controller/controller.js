/**
 * Created by easy8in on 16/1/7.
 */
var _ = require("underscore")._;
var pushEventName = require("./../../lib/consts/pushEventName");
var mailboxMgr = require("./../../lib/message/mailBoxMgr");
var msg = require("./../../lib/message/entites/msg.json");
var base64Str = require("./../../lib/consts/base64String");
var CONSTS = require('./../consts/consts');

var userDao = require("./../../lib/dao/userDao");
var playerDao = require("./../../lib/dao/playerDao");
var broadcastDao = require("./../../lib/dao/broadcastDao");
var auDao = require("./../../lib/dao/auDao");
var confMgr = require("./../../lib/message/confMgr");
var bossMgr = require("./../../lib/message/bossMgr");
var lumiMgr = require("./../../lib/message/lumiMgr");
var timeMgr = require("./../../lib/message/timeMgr");
var playerMgr = require("./../../lib/message/playerMgr");
var campaignMgr = require("./../../lib/message/campaignMgr");
var versionMgr = require("./../../lib/message/versionMgr");
var combatPvalMgr = require("./../../lib/message/combatPvalMgr");
var propsMgr = require("./../../lib/message/propsMgr");
var propsKeyMgr = require("./../../lib/message/propsKeyMgr");
var svrMgr = require("./../../lib/message/svrMgr");
var passRankMgr = require("./../../lib/message/passRankMgr");
var IAPMgr = require("./../../lib/message/IAPMgr");
var noticeDao = require("./../../lib/dao/noticeDao");
var asdkMgr = require("./../../lib/message/asdkMgr");
var emailMgr = require("./../../lib/message/emailMgr");
var esdkMgr = require("./../../lib/message/esdkMgr");
var smsdkMgr = require("./../../lib/message/smsdkMgr");

var Handler = function(){

};

var controller = module.exports = Handler;

var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;

var processor = {
    defaultEvent : function(opts,callback){
        mailboxMgr.getMails(opts,function(arrMsg){
            callback(arrMsg);
        });
    },
    register : function(opts,callback){
        var user = {};
        var account = opts.account || "";
        user.username = !reg.test(account) ? account:"";
        user.useremail = reg.test(account) ? account:"";
        user.password = opts.password|| "";
        user.eid = opts.eid || ""
        if(user.password != ""){
            user.password = base64Str.encodingBase64String(opts.password);
        }

        var args = {"code":CONSTS.ACCOUNT.ACCOUNT_REGISTER_FAIL};
        var dao = new userDao();
        dao.register(user,function(res){
            if(res.code == CONSTS.ACCOUNT.ACCOUNT_REGISTER_SUCCESS){
                callback(res,pushEventName.clientEvent.onRegisterSuccess);
            }else{
                callback(res,pushEventName.clientEvent.onRegisterFail);
            }
        });
    },
    login : function(opts,callback){
        var user = {};
        user.username = !reg.test(opts.account) ? opts.account:"";
        user.useremail = reg.test(opts.account) ? opts.account:"";
        user.password = opts.password|| "";
        user.eid = opts.eid;
        if(user.password != ""){
            user.password = base64Str.encodingBase64String(opts.password);
        }

        var args = {"code":CONSTS.ACCOUNT.ACCOUNT_LOGIN_FAIL};
        var dao = new userDao();
        dao.login(user,function(res){
            if(res.code == CONSTS.ACCOUNT.ACCOUNT_LOGIN_SUCCESS){
                callback(res,pushEventName.clientEvent.onLoginSuccess);
            }else{
                callback(res,pushEventName.clientEvent.onLoginFail);
            }
        });
    },
    updatePass:function(opts,callback){
        var mail = opts.mail;
        var dao = new userDao();
        dao.findUserByMail(mail,function(rs){
            if(rs.items.length > 0){
                emailMgr.sendMail(mail,rs.items[0]._id+"");
                callback({"code":200,"msg":"已经发送到您的邮箱！可能会有一定延迟！"},pushEventName.clientEvent.onUpdatePass);
            }else{
                callback({"code":500,"msg":"未能找到账户信息！"},pushEventName.clientEvent.onUpdatePass);
            }
        });
    },
    createAvatar : function(opts,callback){
        var uid = opts.uid || "";
        if(uid === ""){
            callback(pushEventName.onServerErr.NotLoginArgs,pushEventName.onServerErr.NotLogin);
        }else{
            var dao = new playerDao();
            dao.create(opts,function(res){
                if(res.code === CONSTS.AVATAR.AVATAR_CREATE_SUCCESS){
                    callback(res,pushEventName.clientEvent.onCreateAvatarSuccsess);
                }else{
                    callback(res,pushEventName.clientEvent.onCreateAvatarFail);
                }
            });
        }
    },
    existPlayer : function(opts,callback){
        var uid = opts.uid || "";
        if(uid === ""){
            callback(pushEventName.onServerErr.NotLoginArgs,pushEventName.onServerErr.NotLogin);
        }else{
            var dao = new playerDao();
            dao.existPayer(opts,function(res){
                if(res.code === CONSTS.AVATAR.AVATAR_NICKNAME_EXIST){
                    callback(res,pushEventName.clientEvent.onExistNickname);
                }else{
                    callback(res,pushEventName.clientEvent.onNotExistNickname);
                }
            });
        }
    },
    reqAvatarList : function(opts,callback){
        var uid = opts.uid || "";
            if(uid === ""){
            callback(pushEventName.onServerErr.NotLoginArgs,pushEventName.onServerErr.NotLogin);
        }else{
            var args = {"code":CONSTS.AVATAR.AVATAR_LIST_SUCCESS};
            args.code = CONSTS.ACCOUNT.ACCOUNT_NOTNULL;

            var dao = new playerDao();
            dao.loadPayerList(opts,function(res){
                if(res.code === CONSTS.AVATAR.AVATAR_LIST_SUCCESS){
                    callback(res,pushEventName.clientEvent.onReqAvatarListSuccess);
                }else{
                    callback(res,pushEventName.clientEvent.onReqAvatarListFail);
                }
            });
        }
    },
    savePlayer : function(opts,callback){
        var uid = opts.uid || "";
        var pid = opts.pid || "";
        if(uid === "" || pid === ""){
            callback(pushEventName.onServerErr.NotLoginArgs,pushEventName.onServerErr.NotLogin);
        }else{
            var dao = new playerDao();
            dao.savePlayer(opts,function(res){
                callback(res,pushEventName.clientEvent.onPlayerExecutive);
            });
        }
    },
    loadPlayer : function(opts,callback){
        var uid = opts.uid || "";
        if(uid === ""){
            callback(pushEventName.onServerErr.NotLoginArgs,pushEventName.onServerErr.NotLogin);
        }else{
            var dao = new playerDao();
            dao.loadPayer(opts,function(res){
                callback(res,pushEventName.clientEvent.onPlayerExecutive);
            });
        }
    },
    sendBroadcast:function(opts,callback){
        var broadcast = {};
        broadcast.content = opts.content;
        broadcast.svrName = opts.svrName;
        var dao = new broadcastDao();
        dao.add(broadcast,function(r){
            callback(r.res,pushEventName.clientEvent.onBroadcast);
        });
    },
    timestamp : function(opts,callback){
        var timestamp = Date.parse(new Date()) / 1000;
        callback({"timestamp":timestamp},pushEventName.clientEvent.onTimestamp);
    },
    MercenaryConfig:function(opts,callback){
        confMgr.MercenaryConfig(opts,function(r){
            callback(r,pushEventName.clientEvent.onMercenaryConfig);
        });
    },
    EctypeConfig:function(opts,callback){
        confMgr.EctypeConfig({},function(r){
            callback(r,pushEventName.clientEvent.onEctypeConfig);
        });
    },
    MainichiConfig:function(opts,callback){
        confMgr.MainichiConfig({},function(r){
            callback(r,pushEventName.clientEvent.onMainichiConfig);
        });
    },
    reqBossInfo : function(opts,callback){
        bossMgr.reqBossInfo(opts.svrId,function(r){
            callback(r,pushEventName.clientEvent.onReqBoss);
        });
    },
    attackBoss : function(opts,callback){
        bossMgr.attackBoss(opts,function(r){
            callback(r,pushEventName.clientEvent.onAttakedBoss);
        });
    },
    bossScore : function(opts,callback){
        bossMgr.ScorePlan(opts,function(r){
            callback(r,pushEventName.clientEvent.onBossScore);
        });
    },
    bossRewardList:function(opts,callback){
        bossMgr.RewardList(function(r){
            callback(r,pushEventName.clientEvent.onBossRewardList);
        });
    },
    randomPlayer : function(opts,callback){
        var dao = new playerDao();
        dao.randomPlayer(opts,function(r){
            callback(r,pushEventName.clientEvent.onRandomPlayer);
        });
    },
    onWorldMap : function(opts,callback){
        //var opts = {"pid":1,"lv":1,"nickName":"p1"};
        var dao = new auDao();
        dao.createLogs(opts,function(r){
            callback(r,pushEventName.clientEvent.onWorldMap);
        });
    },
    reflogs : function(opts,callback){
        var dao = new auDao();
        dao.refreshLogs(opts.lib,function(r){
            callback(r,pushEventName.clientEvent.onRefLogs);
        });
    },
    currVersion : function(opts,callback){
        var plf = opts.platform || undefined;
        console.info(plf);
        if(plf === "appstore"){
            versionMgr.currVersionIOS(function(v){
                console.info(v);
                callback(v,pushEventName.clientEvent.onCurrVersion);
                });
        }else{
            versionMgr.currVersion(plf,function(v){
                console.info(v);
                callback(v,pushEventName.clientEvent.onCurrVersion);
                });
        }
    },
    lumiSign  : function(opts,callback){
        var userid = opts.userid || "";
        var openuid = opts.openuid ||"";
        var nickname = opts.nickname || "";
        var sex = opts.sex || "";
        var logintime = opts.logintime || "";
        var sign = opts.sign || "";
        var rt = lumiMgr.testSign(userid,openuid,nickname,sex,logintime,sign);
        var rs = {"uid":userid};
        if(rt){
            callback(rs,pushEventName.clientEvent.onLumiSignSuccess);
        }else{
            callback(rs,pushEventName.clientEvent.onLumiSignFail);
        }
    },
    recharge : function(opts,callback){
        callback(campaignMgr.rechargeInfo(),pushEventName.clientEvent.onUpgrade);
    },
    upgrade : function(opts,callback){
        callback(campaignMgr.upgrade(),pushEventName.clientEvent.onUpgrade);
    },
    legend : function(opts,callback){
        callback(campaignMgr.legend(),pushEventName.clientEvent.onLegend);
    },
    aggregateConsumption:function(opts,callback){
        campaignMgr.aggregateConsumption(opts.pid,opts.startTime,opts.endingTime,function(rs){
            callback(rs,pushEventName.clientEvent.onAggregateConsumption);
        });
    },
    playerRank : function(opts,callback){
        var dao = new playerDao();
        dao.playerRank(opts.svrName,parseInt(opts.lv),function(rank){
            callback(rank,pushEventName.clientEvent.onPlayerRank);
        });
    },
    frlist : function(opts,callback){
        var frlist = {"list" : []};
        var dao = new playerDao();
        dao.findPlayer(opts.pid,function(r){
            if(r.code === CONSTS.AVATAR.AVATAR_LIST_SUCCESS && r.list.length > 0 ){
                var player = r.list[0];
                if(player.hasOwnProperty("svr_frList")){
                    frlist.list = player.svr_frList;
                }
                callback(frlist,pushEventName.clientEvent.onFrlist);
            }else{
                callback(frlist,pushEventName.clientEvent.onFrlist);
            }
        });
    },
    combatPval : function(opts,callback){
        combatPvalMgr.addCombatPval(opts,function(combat){
            callback(combat,pushEventName.clientEvent.combatPval);
        });
    },
    combatPvalRank : function(opts,callback){
        combatPvalMgr.combatPvalRank(opts,function(rank){
            callback(rank,pushEventName.clientEvent.combatPvalRank);
        });
    },
    bossRank : function(opts,callback){
        bossMgr.ScoreRank(opts,function(scoreRank){
            callback(scoreRank,pushEventName.clientEvent.bossRank);
        });
    },
    bindEquipment : function(opts,callback){
        //console.info("bindEquipment[Pid:"+opts.pid+"==Eid:"+opts.eid +"]");
        playerMgr.bindEquipment(opts.pid,opts.eid,function(ots){
            if(ots.status === 200){
                //console.info("bindEquipment Success");
                callback({"timestamp":timeMgr.getTimestamp()},pushEventName.clientEvent.bindSuccess);
            }else{
                //console.info("bindEquipment Fail");
                callback({"timestamp":timeMgr.getTimestamp()},pushEventName.clientEvent.bindFail);
            }
        });
    },
    repeatEquipment : function(opts,callback){
        //console.info("repeatEquipment[Pid:"+opts.pid+"==Eid:"+opts.eid +"]");
        playerMgr.checkEquipment(opts.pid,opts.eid,function(ots){
            if(ots === undefined){
                //console.info("repeatEquipment Unique");
                callback({"timestamp":timeMgr.getTimestamp()},pushEventName.clientEvent.onUnique);
            }else{
                //console.info("repeatEquipment Repeat");
                callback(ots.svr_bindEquipment,pushEventName.clientEvent.onRepeat);
            }
        });
    },
    arenaRank : function(opts,callback){
        var pid = opts.pid;
        var start = parseInt(opts.start);
        var end = parseInt(opts.end);
        playerMgr.arenaRank(pid,opts.svrName,start,end,function(ots){
            callback(ots,pushEventName.clientEvent.onArenaRank);
        });
    },
    arenaListPlayer:function(opts,callback){
        playerMgr.pushArenaPlayer(opts,function(ots){
            callback(ots,pushEventName.clientEvent.onArenaListPlayer);
        });
    },
    arenaPlayerRank:function(opts,callback){
        playerMgr.arenaPlayerRank(opts,function(ots){
            callback(ots,pushEventName.clientEvent.onArenaPlayerRank);
        });
    },
    arenaScore : function(opts,callback){
        //playerMgr.arenaWiner(opts.pid,opts.winPid,opts.losePid);
        playerMgr.arenaScore(opts.pid,opts.vsPid,opts.score,function(rs){
            //res.send(rs);
            callback(rs,pushEventName.clientEvent.onArenaScore);
        });
    },
    araneLogs : function(opts,callback){
        playerMgr.arenaPlayerLogs(opts.pid,function(rs){
            callback(rs,pushEventName.clientEvent.onArenaLogs);
        });
    },
    usePidLoadPlayer : function(opts,callback){
        playerMgr.playerById(opts.playerId,function(ots){
            callback(ots,pushEventName.clientEvent.onPidLoadPlayer);
        });
    },
    useNamePlayer : function(opts,callback){
        playerMgr.playerByName(opts.nickName,function(ots){
            callback(ots,pushEventName.clientEvent.onNameLoadPlayer);
        });
    },
    signConfig : function(opts,callback){
        
        confMgr.SignConfig(function(rs){
            callback(rs,pushEventName.clientEvent.onSignConfig);
        });
        
        /*
        confMgr.testSignConfig(function(rs){
            callback(rs,pushEventName.clientEvent.onSignConfig);
        });
        */
        
    },
    propsOut : function(opts,callback){
        propsMgr.outProps(opts,function(rs){
            callback(rs,pushEventName.clientEvent.onPropsOut);
        });
    },
    propsUse : function(opts,callback){
        propsMgr.useProps(opts,function(rs){
            callback(rs,pushEventName.clientEvent.onPropsUse);
        });
    },
    useKey : function(opts,callback){
        propsKeyMgr.execKey(opts.pid,opts.key,function(rs){
            callback(rs,pushEventName.clientEvent.onUseKey);
        });
    },
    notice : function(opts,callback){
        var dao = new noticeDao();
        dao.findNotice(opts.svrName,function(list){
            if(list.length > 0){
		console.info("notice");
		console.info(list[0]);
                callback(list[0],pushEventName.clientEvent.onNotice);
            }else{
                callback({"timestamp:":timeMgr.getTimestamp()},pushEventName.clientEvent.onNotice);
            }
        });
    },
    svrList : function(opts,callback){
        svrMgr.findSvrList(opts,function(list){
            callback(list,pushEventName.clientEvent.onSvrList);
        });
    },
    svrStatus : function(opts,callback){
        svrMgr.findSvrFielsByName(opts.svrName,["svrName","status"],function(rs){
            callback(rs[0],pushEventName.clientEvent.onSvrStatus);
        });
    },
    surefr : function(opts,callback){
        var frlist = {"isFirst" : 0};
        var dao = new playerDao();
        dao.findPlayerFieldsById(opts.pid,"svr_frTimestamp",function(ots) {
            var player = undefined;
            if (ots.status === 200) {
                player = ots.items[0];
            }
            if(player.hasOwnProperty("svr_frTimestamp")){
                if(player.svr_frTimestamp > 0){
                    frlist.isFirst = 1;
                }
                callback(frlist,pushEventName.clientEvent.onFrlist);
            }else{
                callback(frlist,pushEventName.clientEvent.onFrlist);
            }
        });
    },
    upPass : function(opts,callback){
        passRankMgr.savePassRank(opts,function(code){
             callback(code,pushEventName.clientEvent.onUpPass);
        });
    },
    passRank: function(opts,callback){
        passRankMgr.passRankList(opts,function(rs){
            callback(rs,pushEventName.clientEvent.onPassRank);
        });
    },
    iapVerify:function(opts,callback){
        IAPMgr.verifyReceipt(opts.pid,opts.transaction_id,opts.receipt);
        callback({"timestamp":timeMgr.getTimestamp()},pushEventName.clientEvent.onIAPverify);
    },
    uplv : function(opts,callback){
        playerMgr.upLv(opts.pid,function(rs){
            callback(rs,pushEventName.clientEvent.onUpLv);
        });
    },
    asdkLogin:function(opts,callback){
        asdkMgr.login(opts.accountid,opts.sessionid,function(rs){
            callback(rs,pushEventName.clientEvent.onAsdkLogin);
        });
    },
    esdkLogin:function(opts,callback){
        esdkMgr.login(opts.sdks,opts.apps,opts.uins,opts.sessid,function(rs){
            callback(rs,pushEventName.clientEvent.onEsdkLogin);
        });
    },
    smsdkLogin:function(opts,callback){
        smsdkMgr.login(opts.tokenkey,function(rs){
            callback(rs,pushEventName.clientEvent.onSMsdkLogin);
        });
    },
    smGameSign:function(opts,callback){
        console.info("req:");
        console.info(opts);
        smsdkMgr.gameSign(opts,function(rs){
            console.info("res:");
            console.info(rs);
            callback(rs,pushEventName.clientEvent.onSMGameSign);
        });
    }
};

var funcs = _.functions(processor);

controller.InvokeEventOfName = function(opts,callback){
    var self = processor;
    var eventname = opts.eventname;
    var valid = _.contains(funcs,eventname);
    if(valid){
        self[eventname](opts.args,callback);
    }else{
        callback(pushEventName.onServerErr.NotValidArgs,pushEventName.onServerErr.NotValid);
    }
};
