/**
 * Created by easy8in on 16/10/19.
 */
var timeMgr = require("./timeMgr");
var passRankDao = require("./../../lib/dao/passRankDao");
var async = require("async");

var Handler = function(){
};

var passRankMgr = module.exports = Handler;
var model = {"pid":"","nickName":"","icon":"","level":0,"usetime":0,"svrName":"","svrId":""};

passRankMgr.savePassRank = function(model,callback){
	model.timestamp = timeMgr.getTimestamp();
	var dao = new passRankDao();
	dao.findPass({"pid":model.pid,"level":model.level},function(ls){
		if(ls.length > 0){
			callback({"code":200});
		}else{
			dao.savePass(model,function(code){
				callback(code);
			});
		}
	});
};

passRankMgr.passRankList = function(opts,callback){
	var result = {"currNum":0};
	var pid = opts.pid;
	var svrName = opts.svrName;
	var level = opts.level;
	var dao = new passRankDao();

	dao.findPass({"pid":pid,"level":level},function(ls){
		if(ls.length > 0){
			var ps = ls[0];
			dao.findPassCount({"svrName":svrName,"level":level,"timestamp":{$lt:ps.timestamp}},function(num){
				result.currNum = num + 1;
				dao.findPassList({"svrName":svrName,"level":level},["nickName","icon","usetime","timestamp"],function(item){
					result.rankList = item.items;
					callback(result);
				});
			});
		}else{
			dao.findPassList({"svrName":svrName,"level":level},["nickName","icon","usetime","timestamp"],function(item){
				result.rankList = item.items;
				callback(result);
			});
		}
	});
};