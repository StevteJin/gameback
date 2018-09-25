/**
 * Created by easy8in on 16/8/11.
 */
var timeMgr = require("./timeMgr");

var Handler = function(){
};

var adminMgr = module.exports = Handler;

adminMgr.login = function(username,passwd,callback){
    if(username === "root" && passwd === "VNtoor1200"){
        callback("root_"+timeMgr.getTimestamp());
    }else{
        callback("");
    }
};

adminMgr.inspectLogin = function(key){
    var timestamp = key.split('_')[1];
    console.info(timestamp);
};