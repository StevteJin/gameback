/**
 * Created by easy8in on 16/6/15.
 */
var express = require('express');
var router = express.Router();
var smsdkMgr = require('./../../lib/message/smsdkMgr');

router.get('/',function(req,res,next){
    res.send("smsdkAction Successfully");
});

router.post('/recharge',function(req, res, next){
    console.info("xiao7 recharge post");
    console.info(req.body);
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
    
    smsdkMgr.orderHandling(req.body,function(r){
        res.send(r);
	//res.send("test");
    });
    //res.send("test");
});

router.get('/recharge',function(req, res, next){
    console.info("xiao7 recharge get");
    var opts =
    { encryp_data: req.query.encryp_data,
        extends_info_data: req.query.extends_info_data,
        game_area: req.query.game_area,
        game_level: req.query.game_level,
        game_orderid: req.query.game_orderid,
        game_role_id: req.query.game_role_id,
        game_role_name: req.query.game_role_name,
        sdk_version: req.query.sdk_version,
        subject: req.query.subject,
        xiao7_goid: req.query.xiao7_goid,
        sign_data: req.query.sign_data};
    console.info(opts);
    smsdkMgr.orderHandling(req.body,function(r){
        res.send(r);
    });
});

module.exports = router;
