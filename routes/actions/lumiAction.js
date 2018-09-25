/**
 * Created by easy8in on 16/6/15.
 */
var express = require('express');
var router = express.Router();
var lumiMgr = require('./../../lib/message/lumiMgr');

router.get('/',function(req,res,next){
    res.send("LumiAction Successfully");
});

router.post('/recharge',function(req, res, next){
    //console.info(req.body);
    lumiMgr.orderHandling(req.body,function(r){
        res.send(r);
    });
});

module.exports = router;