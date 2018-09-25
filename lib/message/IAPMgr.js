/**
 * Created by easy8in on 16/10/27.
 */
var Handler = function(){
};

var IAPMgr = module.exports = Handler;

var https = require('https');
var async = require("async");
var CONSTS = require('./../consts/consts');
var receiptDao = require("./../dao/receiptDao");
var playerDao = require("./../dao/playerDao");
var orderDao = require('./../dao/orderDao');
var mailDao = require("./../dao/mailDao");
var lumiPriceIAP = require('./../../conf/lumiPriceIAP.json');
var timeMgr = require('./timeMgr');
var campaignMgr = require('./campaignMgr');
var language  = require("./../consts/language");

IAPMgr.verifyReceipt = function(pid,transaction_id,receipt){
	var dao = new receiptDao();
	// receipt = receipt.replace(/\//g,'');
	dao.findReceiptList({"receipt.transaction_id":transaction_id},function(ls){
		if(ls.length > 0){

		}else{
			verify(receipt,function(resp){
				console.info("IAPMgr");
				// console.info("========================");
				// console.info("transaction_id:"+transaction_id);
				// console.info("========================");
				// console.info("receipt64:"+receipt);
				// console.info("========================");
				// console.info(resp);
				// console.info("========================");
				var status = resp.status;
				if(status != 1){
					dao.saveReceipt(resp,function(ots){});
				}
				if(status === 0 ){//验证成功
					var receiptRs =  resp.receipt;
					var product_id = receiptRs.product_id;
					buy(receiptRs,pid,product_id,transaction_id,0);
				}else{//验证失败
					var ct = "";
					switch(status){
						case 21000:
						  	ct = "The App Store could not read the JSON object you provided.";
							break;
						case 21002:
							ct = "The data in the receipt-data property was malformed or missing.";
							break;
						case 21003:
						  	ct = "The receipt could not be authenticated.";
							break;
						case 21004:
						  	ct = "The shared secret you provided does not match the shared secret on file for your account.";
							break;
						case 21005:
						  	ct = "The receipt server is not currently available.";
							break;
						case 21006:
						  	ct = "This receipt is valid but the subscription has expired. When this status code is returned to your server, the receipt data is also decoded and returned as part of the response.";
							break;
						case 21007:
						  	ct = "This receipt is from the test environment, but it was sent to the production environment for verification. Send it to the test environment instead.";
							break;
						case 21008:
						  	ct = "This receipt is from the production environment, but it was sent to the test environment for verification. Send it to the production environment instead.";
							break;
						default:
							ct = "connection error!";
					}
					// console.info("ct:"+ct);
					var mail = {"pid":pid + "","theme":"","content":ct,"rewardList":"","count":"","from":"Shop","transaction_id":transaction_id,"status":status};
                    var mdao = new mailDao();
                    mdao.sendMailToPlayer(mail,function(mail){});
				}
			});
		}
	});
}

function buy(receipt,pid,product_id,transaction_id,status){
	var priceInfo = lumiPriceInfo(product_id);
	if(priceInfo!=undefined){
		testPlayer(pid,function(player){
	            if(player === undefined){
	                console.info("无法找到用户");
	            }else{
	            	var lage = "chinese";
                    if(player.language != undefined){
                        lage = player.language;
                    }
                    var svrName = player.svrName;
                    var role = player.role;
                    var lang = language[lage];
                    var isfirst = false;
                    var content = "";
                    var propId = "";
                    var propCount = "";
                    var mark = "充值";
                    var donate = 0;
                    var isRecharge = false;
                    if(priceInfo._id === "com.RaytheonGame.SWZJ.appstore.250"){
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

                    var oDao = new orderDao();
                    var order = getOrderObject(receipt,player,priceInfo,donate,mark);
                    order.svrName = svrName;
                    if(isfirst){
                        order.firstRech = "first";
                    }

                    oDao.saveOrder(order,function(ords){
                        var mail = {"pid":player._id + "","theme":lang.buySuccessTheme,"content":content,"rewardList":propId,"count":propCount,"from":lang.fromShop,"transaction_id":transaction_id,"status":status};
                        var dao = new mailDao();
                        dao.sendMailToPlayer(mail,function(mail){
                            console.info("账单完成");
                            if(isRecharge){
                                campaignMgr.recharge(player._id,svrName,priceInfo);//充值返利活动
                            }
                        });
                    });
	            }
	        });
	}
}

function lumiPriceInfo(product_id){
    var orderInfo = undefined;
    for(var key in lumiPriceIAP){
        var info = lumiPriceIAP[key];
        if(info._id === product_id){
            orderInfo = info;
            break;
        }
    }
    return orderInfo;
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

function getOrderObject(opts,player,priceInfo,donate,mark){
    var order = {};
    order.orderid = opts.transaction_id;
    order.currency = opts.product_id;
    order.paytype = "Appstore";
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

function verify(receipt,callback){
	try {
		verifying(receipt,true,function(data){
			var rsJson = JSON.parse(data);
			var status = rsJson.status;
			if(status === 21007){
				verifying(receipt,false,function(rs){
					callback(JSON.parse(rs));
				});
			}else{
				callback(rsJson);
			}
		});
	}catch (err) {
		var rs = {"status":1,"receipt":{}};
	  	callback(rs);
	}
}

function verifying(receiptData_base64, production, cb)
{
    var url = production ? 'buy.itunes.apple.com' : 'sandbox.itunes.apple.com'
    var receiptEnvelope = {
        "receipt-data": receiptData_base64
    };
    var receiptEnvelopeStr = JSON.stringify(receiptEnvelope);
    var options = {
        host: url,
        port: 443,
        path: '/verifyReceipt',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(receiptEnvelopeStr)
        }
    };

    var req = https.request(options, function(res) {
        res.setEncoding('utf8');
        var _data='';
        res.on('data', function (chunk) {
            // console.log("body: " + chunk);
            // cb(true, chunk);
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
    req.write(receiptEnvelopeStr);
    req.end();
}