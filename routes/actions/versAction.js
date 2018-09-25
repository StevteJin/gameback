/**
 * Created by easy8in on 16/6/24.
 */
var express = require('express');
var router = express.Router();

var versMgr = require('./../../lib/message/versionMgr');

router.get('/',function(req,res,next){
    res.send("versAction Successfully");
});

router.post('/addNewVers',function(req, res, next){
    //console.info(req.body);
    var opts = req.body;
    versMgr.addNew(opts,function(r){
        var rs = {"msg":""};
        if(r.status === 200){
            rs.msg = "add new version success!"
        }else{
            rs.msg = "add new version fail!"
        }
        res.send(rs);
    });
});

router.get('/versList',function(req, res, next){
    versMgr.versList(function(item){
        var list = [];
        if(item.status === 200){
            list = item.items;
        }
        res.send(list);
    });
});

router.post('/addiosvers',function(req, res, next){
    //console.info(req.body);
    var opts = req.body;
    versMgr.addNewIOS(opts,function(r){
        var rs = {"msg":""};
        if(r.status === 200){
            rs.msg = "add new version success!"
        }else{
            rs.msg = "add new version fail!"
        }
        res.send(rs);
    });
});

router.get('/iosvers',function(req, res, next){
    versMgr.versListIOS(function(item){
        var list = [];
        if(item.status === 200){
            list = item.items;
        }
        res.send(list);
    });
});

module.exports = router;