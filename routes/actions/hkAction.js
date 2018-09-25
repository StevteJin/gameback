/**
 * Created by easy8in on 16/6/15.
 */
var express = require('express');
var router = express.Router();
var hkMgr = require('./../../lib/message/hkMgr');

router.get('/',function(req,res,next){
    res.send("HkAction Successfully");
});

router.post('/recharge',function(req, res, next){
    //console.info(req.body);
    /*
    var opts = 
    { time: '1478248694',
	  orderId: '8019_116929_1478248694_AP',
	  roleid: '581c35d4fc3c2825694fb9c3',
	  amount: '0.99',
	  coOrderId: '1_581c35d4fc3c2825694fb9c3_1_1478277865',
	  success: '1',
	  gameid: '8019',
	  paytype: '1',
	  ctext: '581c35d4fc3c2825694fb9c3/com.t1gamer.swzj.60',
	  serverid: '1',
	  sdkuid: '982502',
      sign: '0828e62b17e2fdc62fe75832f237b036' };
      */
    hkMgr.orderHandling(req.body,function(r){
        res.send(r);
    });
});

module.exports = router;