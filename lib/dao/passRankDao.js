/**
 * Created by easy8in on 16/10/17.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('passRank');

var Handler = function(){
};

Handler.prototype = {
    savePass : function(model,callback){
        db.create(model,function(ors){
            callback({"code":200});
        });
    },
    findPass : function(query,callback){
        db.read(query,function(item){
            callback(item.items);
        });
    },
    findPassList : function(query,attrName,callback){
         db.findFieldsQuerySort(query,attrName,{"timestamp": 1},function(item){
            callback(item);
        });
    },
    findPassCount : function(query,callback){
        db.count(query,function(num){
            callback(num);
        });
    }
};

module.exports = Handler;