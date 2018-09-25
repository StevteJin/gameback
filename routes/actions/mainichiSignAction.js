/**
 * Created by easy8in on 16/3/20.
 */
var express = require('express');
var router = express.Router();
var mainichiSignDao = require("./../../lib/dao/mainichiSignDao");

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/add',function(req, res, next){
    var item = req.body;
    var dao = new mainichiSignDao();

    dao.findSign(item,function(m){
        if(m.items.length > 0){
            res.send({code:500,msg:'The ' + item.Name + ' is here!'});
        }else{
            dao.addSign(item,function(item){
                if(item.status === 200){
                    res.send({code:200});
                }
            });
        }
    });
});

router.get('/getSignItemList',function(req, res, next){
    var dao = new mainichiSignDao();
    dao.getSignList(function(items){
        var signList = items.items;
        res.send(signList);
    });
});

router.post('/moveSignItem',function(req, res, next){
    var signItem = req.body;

    var dao = new mainichiSignDao();
    dao.removeSign(signItem,function(r){
        res.send({code: r.status,msg: r.message});
    });
});

module.exports = router;