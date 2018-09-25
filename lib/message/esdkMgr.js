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

var esdkMgr = module.exports = Handler;
var appkey = "WI5WQA10G1K5GUTK316F2KEB22KVY4QE";

esdkMgr.orderHandling = function(opts,callback){
    console.info(opts);
    var params = orderParam(opts.cbi);
    var pid = undefined;
    var producet_id = undefined;
    var priceInfo = undefined;
    if(params != undefined){
        pid = params[0];
        producet_id = params[1];
        priceInfo = lumiPriceInfo(producet_id);
    }
    var sign = opts.sign;
    var mSign = myOrderSign(opts);

    if(testOrderSign(sign,mSign)){
        console.info("数据签名不匹配");
        // callback({"Success":0,"Reason":"数据签名不匹配"});
        callback("failure");
    }else if(params === undefined){
        console.info("其它参数不合法");
        // callback({"Success":0,"Reason":"自定义参数不合法"});
        callback("failure");
    }else if(priceInfo === undefined){
        console.info("无法找到订单");
        // callback({"Success":0,"Reason":"无法找到商品"});
        callback("failure");
    }else {
        testPlayer(pid,function(player){
            if(player === undefined){
                console.info("无法找到用户");
                // callback({"Success":0,"Reason":"无法找到用户"});
                callback("failure");
            }else{
                testOrder(opts.tcd,function(isCheck){
                    if(isCheck){
                        console.info("订单重复提交");
                        // callback({"Success":0,"Reason":"订单重复提交"});
                        callback("SUCCESS");
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
                                callback("SUCCESS");
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

function myOrderSign (order){
    var uri = "";
    for (var key of Object.keys(order).sort()) {
        if(key != 'sign'){
            uri += key + '=' + order[key] + "&";
        }
    }
    uri = uri.substring(0,uri.length-1) + appkey;
    return md5(uri);
}

function getOrderObject(opts,player,priceInfo,donate,mark){
    var order = {};
    order.orderid = opts.tcd;
    order.currency = "RMB";
    order.paytype = "ejie";
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

esdkMgr.login = function(sdk,app,uin,sess,callback){
    var rstr = "";
    rstr += "sdk=" + sdk + "&";
    rstr += "app=" + app + "&";
    rstr += "uin=" + uin + "&";
    rstr += "sess=" + sess;
    requestLogin(rstr,function(wrt){
    	//var resp = JSON.parse(wrt);
    	var resp = {"code":Number(wrt).valueOf()};
    	callback(resp);
    });
};


function requestLogin (reqJson,cb){
	var url = "sync.1sdk.cn";
	var options = {
        hostname:url,
	    method: 'GET',
        port:80,
        path:"/login/check.html?"+reqJson
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
    req.end();
}
