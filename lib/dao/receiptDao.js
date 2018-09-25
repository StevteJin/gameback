/**
 * Created by easy8in on 16/10/17.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('receipt');

var Handler = function(){
};

Handler.prototype = {
    saveReceipt : function(model,callback){
        db.create(model,function(ors){
            callback({"code":200});
        });
    },
    findReceiptList : function(query,callback){
        db.read(query,function(item){
            callback(item.items);
        });
    }
};

module.exports = Handler;