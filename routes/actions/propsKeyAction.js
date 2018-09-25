/**
 * Created by easy8in on 16/8/18.
 */
var express = require('express');
var router = express.Router();

var timeMgr = require("./../../lib/message/timeMgr");
var propsKeyMgr = require("./../../lib/message/propsKeyMgr");
var targetTextMgr = require("./../../public/txt/targetTextMgr");

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/execProps',function(req, res ,next){
    var opts = req.body;
    var propsList = "";
    var propsCount = "";
    var itemCount = parseInt(opts.itemCount);
    var start = opts.start;
    var end = opts.end;
    if(opts.propsID1 != ""){
        propsList += opts.propsID1 + ",";
        propsCount += opts.count1 + ",";
    }
    if(opts.propsID2 != ""){
        propsList += opts.propsID2 + ",";
        propsCount += opts.count2 + ",";
    }
    if(opts.propsID3 != ""){
        propsList += opts.propsID3 + ",";
        propsCount += opts.count3 + ",";
    }
    if(opts.propsID4 != ""){
        propsList += opts.propsID4 + ",";
        propsCount += opts.count4 + ",";
    }
    if(propsList.substring(propsList.length-1,propsList.length) === ','){
        propsList = propsList.substring(0,propsList.length - 1);
    }
    if(propsCount.substring(propsCount.length-1,propsCount.length) === ','){
        propsCount = propsCount.substring(0,propsCount.length - 1);
    }
    
    propsKeyMgr.execProps(propsList,propsCount,itemCount,start,end,function(list){
        propsKeyMgr.execSave(list);
        // console.info(list);
        var Num="";
        for(var j=0;j<4;j++)
        {
            Num+=Math.floor(Math.random()*10);
        }
        var fileName = timeMgr.ymdNum() + Num + ".txt.rar";
        targetTextMgr.writeList(fileName,list,function(fileName){
            res.send({"code":200,"fileName":fileName});
        });
    });
});

router.post('/search',function(req,res,next){
    //console.info(req.body);
    var keys = req.body.keys;
    var status = req.body.status;
    var isload = req.body.download;
    var query = {};
    if(keys.length > 0){
        query.key = keys;
    }else if(status != undefined){
        query.status = parseInt(status);
    }

    propsKeyMgr.searchPropsKey(query,function(ots){
        if(ots.length > 0 && isload == "1"){
            var Num="";
            for(var j=0;j<4;j++)
            {
                Num+=Math.floor(Math.random()*10);
            }
            var fileName = timeMgr.ymdNum() + Num + ".txt.rar";
            targetTextMgr.writeList(fileName,ots,function(fileName){
                res.send({"code":200,"fileName":fileName});
            });
        }else{
            res.send(ots);
        }
    });
});

module.exports = router;