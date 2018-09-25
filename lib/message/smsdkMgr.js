/**
 * Created by easy8in on 16/8/11.
 */
var timeMgr = require("./timeMgr");
var http = require('http');
var async = require("async");
var _ = require("underscore")._;
var CONSTS = require('./../consts/consts');
var md5 = require('md5');
var playerDao = require('./../dao/playerDao');
var orderDao = require('./../dao/orderDao');
var mailDao = require('./../dao/mailDao');
var asdkPrice = require('./../../conf/asdkPrice.json');
var campaignMgr = require('./campaignMgr');
var language  = require("./../consts/language");

var Handler = function(){
};

var smsdkMgr = module.exports = Handler;

var gameid = 14834;
var appkey = "6d09c4e57167858ac465f5abbb5b1065";
var game_rsa = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDZcF1IV/7VjHWxq6eAGw9+ssqkAcY0I14Y4UAAnyUqLzS6wIY9QefJpWFfttsewwpmjXVVRv8W/GvPzdN5cMzHSd0c7a1ENt30wyXBawENz1CGEobxeFET4NAnqtBky6HcFUzD4H7Sa+CbLdQGAprXqwsdA3xVW8gwokRTg2qnywIDAQAB";

smsdkMgr.orderHandling = function(opts,callback){
    console.info(opts);
    if(Object.keys(opts).length === 0){
        callback("error");
        return;
    }
    var params = orderParam(opts.extends_info_data);
    var pid = undefined;
    var producet_id = undefined;
    var priceInfo = undefined;
    if(params != undefined){
        pid = params[0];
        producet_id = params[1];
        priceInfo = lumiPriceInfo(producet_id);
    }
    var sign = opts.sign_data;
    var mSign = myOrderSign(opts);

    if(params === undefined){
        console.info("其它参数不合法");
        // callback({"Success":0,"Reason":"自定义参数不合法"});
        callback("failed:order error");
    }else if(priceInfo === undefined){
        console.info("无法找到订单");
        // callback({"Success":0,"Reason":"无法找到商品"});
        callback("failed:game_orderid error");
    }else {
        testPlayer(pid,function(player){
            if(player === undefined){
                console.info("无法找到用户");
                // callback({"Success":0,"Reason":"无法找到用户"});
                callback("failed:game_role_id error");
            }else{
                testOrder(opts.xiao7_goid,function(isCheck){
                    if(isCheck){
                        console.info("订单重复提交");
                        // callback({"Success":0,"Reason":"订单重复提交"});
                        callback("failed:xiao7_goid error");
                    }else{
                        var lage = "chinese";
                        if(player.language != undefined){
                            lage = player.language;
                        }
                        var svrName = player.svrName;
                        var role = player.role;
                        var lang = language[lage];

                        // var byType = params[1];
                        // var lang = params[2];//zh_CN
                        var isfirst = false;
                        var content = "";
                        var propId = "";
                        var propCount = "";
                        var mark = "充值";
                        var donate = 0;
                        var isRecharge = false;
                        if(priceInfo._id == "com.t1gamer.swzj.yueka"){
                            mark = "月卡";
                            content = lang.buyMonthCardContent;
                            propId  += "3001,MCAR,VIP";
                            propCount += priceInfo.Count3+",1,"+priceInfo.Count3;
                        }else{
                            isRecharge = true;
                            if(!player.hasOwnProperty("svr_frTimestamp") || player.svr_frTimestamp === 0 ){
                                isfirst = true;
                                var pd = new playerDao();
                                pd.firstRecharge(pid);
                            }
                            content = isfirst ? (lang.buy+":") + priceInfo.Count + ("\n"+lang.firstBuy+":") + priceInfo.DonateDia : "";
                            propId = 3001;
                            propCount = isfirst ? priceInfo.Count + priceInfo.DonateDia : priceInfo.Count3;
                            donate = isfirst ? priceInfo.DonateDia : 0;
                            propId  += ",VIP";
                            propCount += "," + priceInfo.Count;
                            if(isfirst){
                                //524 是佣兵#83
                                if(role.id == 10001){
                                    propId += ",524,1012,1013,1014,1015";
                                    propCount +=",1,1,1,1,1";
                                }else if(role.id == 10002){
                                    propId += ",524,1090,1091,1092,1093";
                                    propCount +=",1,1,1,1,1";
                                }
                            }
                        }

                        var dao = new orderDao();
                        var order = getOrderObject(opts,player,priceInfo,donate,mark);
                        order.svrName = svrName;
                        if(isfirst){
                            order.firstRech = "first";
                        }
                        dao.saveOrder(order,function(ords){
                            var mail = {"pid":player._id + "","theme":lang.buySuccessTheme,"content":content,"rewardList":propId,"count":propCount,"from":lang.fromShop};
                            var dao = new mailDao();
                            dao.sendMailToPlayer(mail,function(mail){
                                console.info("账单完成");
                                if(isRecharge){
                                    campaignMgr.recharge(player._id,svrName,priceInfo);//充值返利活动
                                }
                                // callback({"Success":1,"Reason":"账单完成"});
                                callback("success");
                            });
                        });
                    }
                });
            }
        });
    }
};

function orderParam(info) {
    var strs = info.split("/");
    if (strs.length === 2) {
        return strs;
    }else{
        return undefined;
    }
}

function lumiPriceInfo(producet_id){
    var orderInfo = undefined;
    for(var key in asdkPrice){
        var info = asdkPrice[key];
        if(info._id === producet_id){
            orderInfo = info;
            break;
        }
    }
    return orderInfo;
}

function testOrder(orderid,callback){
    var dao = new orderDao();
    dao.findOrder(orderid,function(list){
        console.info(list);
        if(list.length > 0){
            callback(true);
        }else{
            callback(false);
        }
    });
}

function testPlayer(pid,callback){
    var dao = new playerDao();
    dao.findPlayer(pid,function(r){
        if(r.code === CONSTS.AVATAR.AVATAR_LIST_SUCCESS && r.list.length > 0 ){
            callback(r.list[0]);
        }else{
            callback(undefined);
        }
    });
}

function testOrderSign(lumiSign,orderSign){
    return lumiSign === orderSign ? 0 : 1;
}

/*
{ xiao7_goid: '17352780',
  subject: '购买60钻石',
  game_orderid: 'SM1529569288',
  game_area: '圣武大陆',
  game_role_id: '5899e3d6a649af605250de7d',
  game_role_name: '纪若南',
  game_level: '2',
  extends_info_data: '5b2b5e0dd7ac8566e59aab1d/com.t1gamer.swzj.60',
  sdk_version: '2.0',
  encryp_data: 'ljUFK81q7DDntdcdHPGHRmvG0EjDSqRxc6Iiybqh4JTW8nIBeQoeP9JG5jXEUYGD2IXp1aG4LcuuqGSSRDYTHBLWb4ExARKe+9fiSSQ+K0GRqOMNUpFo2Yi3NEOKTbnmqBm86/qQxsjqQT19xtLoYFUeeui1uv3BjrD4AOS2ZDg=',
  sign_data: 'qJk1V2+Dbfi1adYdaC2QuW9sx4ANYosDeZ7BDp5rAdtEIMcw0XrNUlc2sPCOEDH6YP6snrmXb4fxaClxw2oAhRxLw4lO/vR0gtYc3EOYLTdn2YK/mBhK7v9tItNSMRFT3lmU8Ui2w3ABpnYWDodBN++QrcjxpcF0GoEQqCVjE1A=' }
*/

function myOrderSign (order){
    var uri = "";
    for (var key of Object.keys(order).sort()) {
        if(key != 'sign_data'){
            uri += key + '=' + order[key] + "&";
        }
    }
    uri = uri.substring(0,uri.length-1);
    return md5(uri);
}

function getOrderObject(opts,player,priceInfo,donate,mark){
    var order = {};
    order.orderid = opts.xiao7_goid;
    order.currency = "RMB";
    order.paytype = "x7";
    order.amount = priceInfo.Commodity;
    order.payCount = priceInfo.Count;
    order.extraCount = priceInfo.Count2;
    order.count = priceInfo.Count3;
    order.firstCount = donate;
    order.pid = player._id + "";
    order.nickName = player.nickName;
    order.lv = player.role.lv;
    order.mark = mark;
    order.body = opts;
    order.timestamp = timeMgr.getTimestamp();
    return order;
}

smsdkMgr.gameSign = function (opts,callback) {
    var game_orderid = "SM"+timeMgr.getTimestamp();
    var notify_id = "-1";

    var str = "extends_info_data="+opts.extends_info_data;
    str += "&game_area="+opts.game_area;
    str += "&game_guid="+opts.game_guid;
    str += "&game_level="+opts.game_level;
    str += "&game_orderid="+game_orderid;
    str += "&game_price="+opts.game_price;
    str += "&game_role_id="+opts.game_role_id;
    str += "&game_role_name="+opts.game_role_name;
    str += "&notify_id=-1";
    str += "&subject="+opts.subject;
    opts.game_orderid = game_orderid;
    opts.notify_id = notify_id;
    opts.game_sign = md5(str + game_rsa);
    callback(opts);
};

smsdkMgr.login = function(tokenkey,callback){
    var msign = md5(appkey + tokenkey);
    var rstr = "tokenkey="+ tokenkey + "&sign=" + msign;

    requestLogin(rstr,function(wrt){
    	var resp = JSON.parse(wrt);
    	if(resp.errorno == 0){
    	    var success = {"errorno":resp.errorno,"guid":resp.data.guid};
            callback(success);
        }else{
            var fail = {"errorno":resp.errorno,"guid":0};
            callback(fail);
        }
    });
};


function requestLogin (reqJson,cb){
	var url = "api.x7sy.com";
	var options = {
        method: 'POST',
        hostname:url,
        path:"/user/check_login",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(reqJson)
        }
    };

    var req = http.request(options, function(res) {
	    res.setEncoding('utf8');
	    var _data='';
	    res.on('data', function (chunk) {
	        _data +=chunk;
	    });
	    res.on('end', function(){
	            cb!=undefined && cb(_data);
	       });
	    res.on('error', function (error) {
	        console.log("error: " + error);
	        // cb(false, error);
	    });
    });
    req.write(reqJson);
    req.end();

}