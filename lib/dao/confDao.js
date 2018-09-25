/**
 * Created by easy8in on 16/3/27.
 */
var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var monsterDao = require("./../../lib/dao/monsterDao");
var ectypeDao = require("./../../lib/dao/ectypeDao");
var mainichiSignDao = require("./../../lib/dao/mainichiSignDao");
var bossDao = require("./../../lib/dao/bossDao");
var async = require("async");

var Handler = function(){
};

Handler.prototype = {
    refConf : function(callback){
        var conf = {};
        var mdao = new monsterDao();
        mdao.getTodayMonster(function(res){
            conf.monster = res.items;
            var edao = new ectypeDao();
            edao.getTodayEctypeList(function(res){
                conf.ectype = res.items[0].ectypeName;
                var bdao = new bossDao();
                bdao.getTodayBossList(function(res){
                    conf.boss = res.items;
                    callback(conf);
                });
            });
        });
    }
};

module.exports = Handler;

