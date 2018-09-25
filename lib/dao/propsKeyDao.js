/**
 * Created by easy8in on 16/8/18.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('propsKey');

var Handler = function(){
};

Handler.prototype = {
    savePropsKey : function(model){
        db.create(model,function(ots){});
    },
    updatePropsKey : function(id,updateModel,callback){
        db.updateById(id,updateModel,function(ots){
            callback(ots);
        });
    },
    findPropsKey : function(key,callback){
        db.read({"key":key},function(ots){
            callback(ots);
        });
    },
    findPropsKeyQuery : function(query,callback){
        db.read(query,function(ots){callback(ots);});
    }
};

module.exports = Handler;