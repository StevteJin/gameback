var pushEventName = require("./../../lib/consts/pushEventName");
var async = require("async");
var _ = require("underscore")._;
var monsterDao = require("./../../lib/dao/monsterDao");
var ectypeDao = require("./../../lib/dao/ectypeDao");
var mainichiSignDao = require("./../../lib/dao/mainichiSignDao");
var gameConfDao = require("./../../lib/dao/gameConfDao");
var bossDao = require("./../../lib/dao/bossDao");
var ectypes = require("./entites/ectype.json");
var timeMgr = require("./timeMgr");
var sign = require('./../../conf/signConfig.json');
var sign1 = require('./../../conf/2016-01Config.json');
var sign2 = require('./../../conf/2016-02Config.json');
var sign3 = require('./../../conf/2016-03Config.json');
var sign4 = require('./../../conf/2016-04Config.json');
var sign5 = require('./../../conf/2016-05Config.json');
var sign6 = require('./../../conf/2016-06Config.json');
var sign7 = require('./../../conf/2016-07Config.json');
var sign8 = require('./../../conf/2016-08Config.json');
var sign9 = require('./../../conf/2016-09Config.json');
var sign10 = require('./../../conf/2016-10Config.json');
var sign11 = require('./../../conf/2016-11Config.json');
var sign12 = require('./../../conf/2016-12Config.json');
var Handler = function(){
};

var ectypeName = {
    "DragonValley":"GoblinForest",
    "GoblinForest":"IceArctic",
    "IceArctic":"DwarfValley",
    "DwarfValley":"DragonValley"
};

var confMgr = module.exports = Handler;

confMgr.MercenaryConfig = function(opts,callback){
    var mdao = new monsterDao();
    mdao.getTodayMonster(opts.svrName,function(res){
        callback(res.items);
    });
};

confMgr.EctypeConfig = function(opts,callback){
    var ecArr = [];
    var edao = new ectypeDao();
    edao.getTodayEctypeList(function(er){
        if(er.items.length > 0){
            var ens = er.items[0].ectypeName;
            for(var i = 0; i < ens.length; i++){
                ecArr.push(ens[i]);
            }
        }else{
            var week = timeMgr.todayOfWeek();
            var w1 = [1,3,5];
            var w2 = [2,4,6];
            if(week === 7){
                ecArr = ["DragonValley", "GoblinForest", "IceArctic", "DwarfValley"];
            }else if(_.contains(w1, week)){
                ecArr = ["DragonValley", "GoblinForest"];
            }else if(_.contains(w2, week)){
                ecArr = ["IceArctic", "DwarfValley"];
            }
        }

        var itemList = [];
        for(var j = 0 ; j < ecArr.length; j++){
            itemList = itemList.concat(ectypes[ecArr[j]].mapId);
        }
        callback(itemList);
    });
};

confMgr.BossConfig = function(callback){
    var bdao = new bossDao();
    bdao.getBossList(function(res){
        callback(res.items);
    });
};

confMgr.getTodayBossConfg = function(callback){
    var bdao = new bossDao();
    bdao.getTodayBossList(function(res){
        callback(res.items);
    });
};

confMgr.DropoutConfig = function(opts,callback){
    var dao = new gameConfDao();
    dao.loadConf(function(r){
        callback(r.items[0].dropout);
    });
};

confMgr.EpxConfg = function(opts,callback){
    var dao = new gameConfDao();
    dao.loadConf(function(r){
        callback(r.items[0].experience);
    });
};

confMgr.MainichiConfig = function(opts,callback){
    var dao = new mainichiSignDao();
    dao.getTodaySign(function(r){
        callback(r.items);
    })
};

confMgr.testSignConfig = function(callback){
    callback(sign);
}

confMgr.SignConfig = function(callback){
    var date = new Date();
    var month = date.getMonth() < 10 ? '0' + (date.getMonth()+1) : (date.getMonth()+1);
    var monthNum =parseInt(month);
    var tmp = 0;
    if(monthNum > 8){
        tmp = monthNum - 8;
    }else{
        tmp = monthNum + 4;
    }
    var m = tmp < 10 ? '0'+tmp:tmp+"";
    switch(m){
        case "01":
            callback(sign1);
            break;
        case "02":
            callback(sign2);
            break;
        case "03":
            callback(sign3);
            break;
        case "04":
            callback(sign4);
            break;
        case "05":
            callback(sign5);
            break;
        case "06":
            callback(sign6);
            break;
        case "07":
            callback(sign7);
            break;
        case "08":
            callback(sign8);
            break;
        case "09":
            callback(sign9);
            break;
        case "10":
            callback(sign10);
            break;
        case "11":
            callback(sign11);
            break;
        case "12":
            callback(sign12);
            break;
    }
    //callback(m);
};

function getYMD(date){
    var y = date.getFullYear();
    var m = date.getMonth() < 10 ? '0' + (date.getMonth()+1) : (date.getMonth()+1);
    var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return y + '-' + m + '-' + d;
}