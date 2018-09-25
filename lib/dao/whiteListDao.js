/**
 * Created by easy8in on 16/10/17.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('whiteList');

var Handler = function(){
};

Handler.prototype = {
    saveWhiteList : function(model,callback){
        db.create(model,function(ors){
            callback({"code":200});
        });
    },
    findWhiteList : function(query,callback){
        db.read(query,function(item){
            callback(item.items);
        });
    },
    delWhiteLists : function(uid,callback){
        db.del({"uid":uid},function(rs){
            callback(rs);
        });
    }
};

module.exports = Handler;