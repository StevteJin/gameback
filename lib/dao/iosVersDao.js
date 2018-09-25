/**
 * Created by easy8in on 16/12/01.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var _ = require("underscore")._;
var db = new Monogo('iosvers');

var Handler = function(){
};

Handler.prototype = {
    addNewVersion : function(version,callback){
        db.create(version,function(item){
            callback(item);
        });
    },
    findList : function(sort,limitNum,callback){
        db.loadSort({},sort,0,limitNum,function(item){
            callback(item);
        });
    }
};

module.exports = Handler;