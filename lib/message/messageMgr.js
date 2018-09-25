var _ = require("underscore")._;
var msg = require("./entites/msg.json");
var arrMsg = require("./entites/arrMsg.json");
var base64Str = require("./../../lib/consts/base64String");
var controller = require("./../controller/controller");
var pushEventName = require("./../../lib/consts/pushEventName");

var Handler = function(){

};

var messageMgr = module.exports = Handler;

messageMgr.executeMsg = function(req,res){
    //console.info(req.body);
    //console.info(req.body.d);
    var opts = JSON.parse(base64Str.decodingBase64String(req.body.d));
    //console.info(opts);
    //console.info(req.cookies);

    var uid = req.cookies.uid || "";
    var pid = req.cookies.pid || "";
    if(uid === "" ){
        //console.error("not login");
    }else{
        opts.args.uid = uid;
    }
    if(pid === ""){
        //console.error("not avater");
    }else{
        opts.args.pid = pid;
    }

    //console.info(opts);

    if( (uid != "" && pid != "")
        || opts.eventname === "login"
        || opts.eventname === "register"
        || opts.eventname === "reqAvatarList"
        || opts.eventname === "createAvatar"
        || opts.eventname === "currVersion"
        || opts.eventname === "lumiSign"
        || opts.eventname === "notice"
        || opts.eventname === "svrList"
        || opts.eventname === "asdkLogin"
        || opts.eventname === "esdkLogin"
        || opts.eventname === "smsdkLogin"
        || opts.eventname === "updatePass"){
        controller.InvokeEventOfName(opts,function(args,eventname){
            if(arguments.length == 2){
                pushMsg(args,eventname,res);
            }else if(arguments.length == 1){
                pushArrMsg(args,res);
            }
        });
    }else{
        pushMsg(pushEventName.onServerErr.NotLoginArgs,pushEventName.onServerErr.NotLogin,res);
    }
};

var pushMsg = function(args,eventname,res){
    var newMsg = _.clone(msg);
    newMsg.eventname = eventname;
    newMsg.args = args;
    sendResponse(res,newMsg);
};

var pushArrMsg = function(msgs,res){
    var newArrmsg = _.clone(arrMsg);
    newArrmsg.eventList = msgs;
    sendResponse(res,newArrmsg);
};


var sendResponse = function(res,msg){
    res.send(base64Str.encodingBase64String(JSON.stringify(msg)));
};
