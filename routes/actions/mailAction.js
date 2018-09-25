/**
 * Created by easy8in on 16/6/24.
 */
var express = require('express');
var router = express.Router();
var mailDao = require("./../../lib/dao/mailDao");

router.get('/',function(req,res,next){
    res.send("mailAction Successfully");
});

router.post('/sendMail',function(req, res, next){
    //console.info(req.body);
    var opts = req.body;
    var mail = {"pid":opts.pid,"theme":opts.theme,"content":opts.content,"rewardList":"","count":"","from":opts.from};
    var dao = new mailDao();
    dao.sendMailToPlayer(mail,function(ml){
    });
    res.send({"code":200,"msg":"Success"});
});

module.exports = router;