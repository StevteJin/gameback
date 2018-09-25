/**
 * Created by easy8in on 16/8/18.
 */
var Handler = function(){
};

var propskeyMgr = module.exports = Handler;
var _ = require("underscore")._;
var async = require("async");
var timeMgr = require("./timeMgr");
var propsKeyDao = require("./../dao/propsKeyDao");
var playerDao = require("./../dao/playerDao");
var mailDao = require("./../dao/mailDao");
var language  = require("./../consts/language");

propskeyMgr.execProps = function(propsList,propsCount,itemCount,start,end,callback){
    var arr = [];
    var key = timeMgr.ymdNum();
    var uniKey = timeMgr.getTimestamp();
    // console.info("UNIKEY1:"+uniKey);
    for(var uni=0;uni<9;uni++)
    {
        uniKey+=Math.floor(Math.random()*10)+"";
    }
    // console.info("UNIKEY2:"+uniKey);
    for(var i = 0 ; i<itemCount; i++){
        var temp = "";
        for(var u=0;u<9;u++)
        {
            temp+=Math.floor(Math.random()*10);
        }
        var ekey = key + temp;
        var model = {"key":ekey,"uniKey":uniKey,"propsList":propsList,"propsCount":propsCount,"start":start,"end":end,"status":0};
        arr.push(model);
    }
    callback(arr);
};

propskeyMgr.execSave = function(propsKeyList){
    var dao = new propsKeyDao();
    for(var i = 0 ; i < propsKeyList.length; i++){
        var model = propsKeyList[i];
        dao.savePropsKey(model);
    }
};

propskeyMgr.searchPropsKey = function(query,callback){
    var dao = new propsKeyDao();
    dao.findPropsKeyQuery(query,function(ots){
        callback(ots.items);
    });
};

propskeyMgr.execKey = function(pid,key,callback){
    var dao = new propsKeyDao();
    var pdo = new playerDao();
    dao.findPropsKey(key,function(ots){
        if(ots.items.length > 0){
            var keys = ots.items[0];
            var timestamp = timeMgr.getTimestamp();
            var endTimestamp = timeMgr.getTimestampOfDate(new Date(keys.end+" 11:59:59"));
            if(keys.status != 0 ){
                callback({"code":1});//used
            }else if(timestamp > endTimestamp){
                callback({"code":2});//outTime
            }else{
                dao.findPropsKeyQuery({"uniKey":keys.uniKey,"execPlayer.pid":pid},function(uniRs){
                    if(uniRs.items.length > 0){
                        callback({"code":4});//重复领取
                    }else{
                        pdo.findPlayerFieldsById(pid,["nickName","language"],function(dblist){
                        var list = dblist.items;
                        if(list.length > 0){
                            var player = list[0];
                            exec(keys,player);
                        }
                        });
                        callback({"code":200});
                    }
                });
            }
        }else{
            callback({"code":3});//no have
        }
    });
};

function exec(keys,player){
    //console.info(player);
    var updateModel = {"status":1,"execTimestamp":timeMgr.getTimestamp(),"execPlayer":{"pid":player._id+"","nickName":player.nickName}};
    var dao = new propsKeyDao();
    dao.updatePropsKey(keys._id+"",updateModel,function(keyres){
        var lage = "chinese";
        if(player.language != undefined){
            lage = player.language;
        }
        var lang = language[lage];
        var mail = {"pid":player._id + "","theme":lang.keysTheme,"content":lang.keysContent,"rewardList":keys.propsList,"count":keys.propsCount,"from":"GM"};
        var mDao = new mailDao();
        mDao.sendMailToPlayer(mail,function(){
        });
    });
}