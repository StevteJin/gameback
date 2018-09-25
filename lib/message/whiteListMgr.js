/**
 * Created by easy8in on 16/10/17.
 */
var Handler = function(){
};

var whiteListDao = require("./../dao/whiteListDao");
var timeMgr = require("./timeMgr");

var whiteListMgr = module.exports = Handler;

whiteListMgr.addList = function(uid,nickName,callback){
	var dao = new whiteListDao();
	dao.saveWhiteList({'uid':uid,"nickName":nickName},function(rs){
		callback(rs);
	});
};

whiteListMgr.findList = function(callback){
	var dao = new whiteListDao();
	dao.findWhiteList({},function(rs){
		callback(rs);
	});
};

whiteListMgr.findListByUID = function(uid,callback){
	var dao = new whiteListDao();
	dao.findWhiteList({"uid":uid},function(rs){
		callback(rs);
	});
};

whiteListMgr.delList = function(uid,callback){
	var dao = new whiteListDao();
	dao.delWhiteLists(uid,function(rs){
		callback(rs);
	});
}