/**
 * Created by easy8in on 16/3/15.
 */
var express = require('express');
var router = express.Router();

var bossMgr = require("./../lib/message/bossMgr");
var playerMgr = require("./../lib/message/playerMgr");

//http://127.0.0.1:3030/timer

router.get('/refreshBoss',function(req,res,next){
    var time = req.query.time;
    var hp = req.query.hp;
    bossMgr.initBoss(time,hp,function(bossInfo){
        res.send(bossInfo);
    });
});

router.get('/settleArena',function(req,res,next){
    playerMgr.sendAwardArenaPlayer(function(str){
        res.send('settleArena is end!');
    });
});
module.exports = router;