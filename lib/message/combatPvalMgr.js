/**
 * Created by easy8in on 16/6/26.
 */
var playerDao = require('./../dao/playerDao');
var async = require("async");
var _ = require("underscore")._;

var Handler = function(){
};

var combatPvalMgr = module.exports = Handler;

combatPvalMgr.addCombatPval = function (opts,callback){
    var dao = new playerDao();
    var combat = {};
    combat.hp = opts.hp;//生命值
    combat.mp = opts.mp;//魔法值
    combat.assault = opts.assault;//攻击
    combat.defense = opts.defense;//防御
    combat.tempo   = opts.tempo;//速度
    combat.hitRate = opts.hitRate;//命中率
    combat.dodgeRate   = opts.dodgeRate;//闪避
    combat.critRate= opts.critRate;//暴率
    combat.critHarm= opts.critHarm;//暴伤
    combat.stunRate= opts.stunRate;//击晕
    combat.combatPowerVal = opts.combatPowerVal;//战力值
    combat.m1cpv = opts.m1cpv;//佣兵1战力值
    combat.m2cpv = opts.m2cpv;//佣兵3战力值
    combat.m3cpv = opts.m3cpv;//佣兵3战力值
    combat.arenam1cpv = opts.arenam1cpv;//佣兵1战力值
    combat.arenam2cpv = opts.arenam2cpv;//佣兵2战力值
    combat.arenam3cpv = opts.arenam3cpv;//佣兵3战力值
    dao.updateCombat(opts.pid,combat);
    callback(combat);
};

combatPvalMgr.combatPvalRank = function(opts,callback){
    var cpval = opts.cpval;
    var svrName = opts.svrName;
    async.waterfall([
        function(next){//查询排名
            var dao = new playerDao();
            dao.playerCpvalRank(svrName,cpval,function(rk){
                next(null,cpval,rk.cpvalRank);
            });
        },function(cpval,crank,next){
            var dao = new playerDao();
            dao.findPvalRank({"svr_closeTimestamp":{$lte:0},"svrName":svrName,"svr_combat.combatPowerVal" : {$gt : 0}},["nickName","role","nMercanarList","currentMercanar","currentEquips","currentEquips2","isEquip2","currentFashion","isFashion","svr_combat"],function(item){
                var rankList = [];
                if(item.status === 200){
                    rankList = item.items;
                }
                next(null,cpval,crank,rankList);
            });
        }
    ],function(err,cpval,crank,rankList){
        var rank = {};
        rank.cpval = cpval;
        rank.crank = crank;
        rank.rankList = rankList;
        callback(rank);
    });
};

combatPvalMgr.webCombatPvalRank = function(svrName,callback){
    var dao = new playerDao();
    dao.findWebPvalRank({"svr_closeTimestamp":{$lte:0},"svrName":svrName,"svr_combat.combatPowerVal" : {$gt : 0}},["nickName","role","svr_combat"],function(item){
        var rankList = [];
        if(item.status === 200){
            rankList = item.items;
        }
        callback(rankList);
    });
}