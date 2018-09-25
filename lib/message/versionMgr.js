/**
 * Created by easy8in on 16/6/24.
 */

var versDao = require('./../../lib/dao/versDao');
var iosVersDao = require('./../../lib/dao/iosVersDao');
var timeMgr = require('./timeMgr');

var Handler = function(){
};

var versionMgr = module.exports = Handler;

versionMgr.addNew = function(opts,callback){
    var version = {
        "versionCode":110,
        "versionStr":"1.1.0",
        "downloadUri" : "https://www.pgyer.com/swzj"
    };

    version.versionCode = parseInt(opts.versionCode);
    version.versionStr = opts.versionStr;
    version.downloadUri = opts.downloadUri;
    version.timestamp = timeMgr.getTimestamp();
    version.createDate = timeMgr.getTodayDate();

    var dao = new versDao();
    dao.addNewVersion(version,function(res){
        callback(res);
    });
};

versionMgr.addNewIOS = function(opts,callback){
    var version = {
        "versionCode":110,
        "versionStr":"1.1.0",
        "downloadUri" : "https://www.pgyer.com/swzj"
    };

    version.versionCode = parseInt(opts.versionCode);
    version.versionStr = opts.versionStr;
    version.downloadUri = opts.downloadUri;
    version.timestamp = timeMgr.getTimestamp();
    version.createDate = timeMgr.getTodayDate();

    var dao = new iosVersDao();
    dao.addNewVersion(version,function(res){
        callback(res);
    });
};

versionMgr.currVersion = function(platform,callback){
    var dao = new versDao();
    dao.findList({"timestamp":-1},1,function(item){
        var version = {
            "versionCode":110,
            "versionStr":"1.1.0",
            "downloadUri" : "https://www.pgyer.com/swzj"
        };
        if(item.status === 200 && item.items.length > 0){
            var vers = item.items[0];
            version.versionCode = vers.versionCode;
            version.versionStr = vers.versionStr;
            version.downloadUri = vers.downloadUri;
            if(platform === "agame-MI"){
                version.downloadUri = "http://app.mi.com/details?id=com.gamelumi.lumi.swzj.mi";
            }else if(platform === "agame-Qihoo"){
                version.downloadUri = "http://u.360.cn/swzj";
            }else if(platform === "agame-UC"){
                version.downloadUri = "http://www.9game.cn/shengwuzhanji/";
            }
            else if(platform === "agame-HuaWei"){
                version.downloadUri = "http://appstore.huawei.com/app/C10719822";
            }
            /**/
        }
        callback(version);
    });
};

versionMgr.currVersionIOS = function(callback){
    var dao = new iosVersDao();
    dao.findList({"timestamp":-1},1,function(item){
        var version = {
            "versionCode":110,
            "versionStr":"1.1.0",
            "downloadUri" : "https://www.pgyer.com/swzj"
        };
        if(item.status === 200 && item.items.length > 0){
            var vers = item.items[0];
            version.versionCode = vers.versionCode;
            version.versionStr = vers.versionStr;
            version.downloadUri = vers.downloadUri;
        }
        callback(version);
    });
};

versionMgr.versList = function(callback){
    var dao = new versDao();
    dao.findList({"timestamp":-1},10,function(item){
        //console.info(item);
        callback(item);
    });
};

versionMgr.versListIOS = function(callback){
    var dao = new iosVersDao();
    dao.findList({"timestamp":-1},10,function(item){
        //console.info(item);
        callback(item);
    });
};
