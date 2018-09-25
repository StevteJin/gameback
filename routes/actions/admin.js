var express = require('express');
var router = express.Router();

var playerDao = require("./../../lib/dao/playerDao");
var userDao = require("./../../lib/dao/userDao");
var adminMgr = require("./../../lib/message/adminMgr");
var combatPvalMgr = require("./../../lib/message/combatPvalMgr");
var whiteListMgr = require("./../../lib/message/whiteListMgr");
var base64Str = require("./../../lib/consts/base64String");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/whiteList',function(req,res,next){
  whiteListMgr.findList(function(rs){
     res.send(rs);
  });
});

router.post('/addwhiteList',function(req,res,next){
  var opts = req.body;
  whiteListMgr.addList(opts.uid,opts.nickName,function(rs){
    if(rs.code == 200){
       res.send({"msg":"add Player to whiteList Successfully!"});
    }else{
        res.send({"msg":"add Player to whiteList Fail!"});
    }
  })
});

router.post('/delwhiteList',function(req,res,next){
  var opts = req.body;
  whiteListMgr.delList(opts.uid,function(rs){
    res.send(rs);
  });
});

router.post('/webLogin',function(req,res,next){
  var opts = req.body;
  adminMgr.login(opts.username,opts.password,function(key){
    if(key.length > 0){
      res.send({"code":200,"loginName":key});
    }else{
      res.send({"code":500});
    }
  });
});

router.post('/upass',function(req,res,next){
  var opts = req.body;
  console.info(opts);
  var link = opts.link;
  var uid = link;
  var new_password = opts.new_password;
  var confrim_password = opts.confirm_password;
  var rs = {"code":200,"msg":"修改成功！"};
  if(new_password == confrim_password){
      var dao = new userDao();
      dao.updatePass(uid,{"password":base64Str.encodingBase64String(new_password)});
  }else{
    rs.code = 500;
    rs.msg = "修改失败，两次输入密码不同";
  }
  res.send(rs);
});

router.post('/findPlayer',function(req, res, next){
  var txt = req.body.txt;
  var dao = new playerDao();
  dao.regexFindPlayer(txt,function(r){
    //console.info(r.items.length);
    res.send(r.items);
  });
});

router.post('/updateGameMoneyItems',function(req, res, next){
  //console.info(req.body);
  var pid = req.body.pid;
  var id = parseInt(req.body.id);
  var num = parseInt(req.body.num);
  var dao = new playerDao();
  dao.loadPayer({"pid":pid},function(r){
    //console.info(player);
    var player = r.player[0];
    var items = player.gameMoneyItems;
    for(var i = 0 ; i< items.length ; i++){
      var item = items[i];
      if(item.id === id){
        items[i].num = num;
      }
    }
    //console.info(items);
    var opts = {"pid":pid,"player":{"gameMoneyItems":items}};
    dao.savePlayer(opts,function(rs){
    });
    res.send(req.body);
  });
});

router.post('/updateEquipAdvanceList',function(req, res, next){
  //console.info(req.body);
  var pid = req.body.pid;
  var id = parseInt(req.body.id);
  var num = parseInt(req.body.num);
  var dao = new playerDao();
  dao.loadPayer({"pid":pid},function(r){
    //console.info(player);
    var player = r.player[0];
    var items = player.equipAdvanceItems;
    for(var i = 0 ; i< items.length ; i++){
      var item = items[i];
      if(item.id === id){
        items[i].num = num;
      }
    }
    //console.info(items);
    var opts = {"pid":pid,"player":{"equipAdvanceItems":items}};
    dao.savePlayer(opts,function(rs){
    });
    res.send(req.body);
  });
});

router.post('/updateEquipChipItems',function(req, res, next){
  //console.info(req.body);
  var pid = req.body.pid;
  var id = parseInt(req.body.id);
  var num = parseInt(req.body.num);
  var dao = new playerDao();
  dao.loadPayer({"pid":pid},function(r){
    //console.info(player);
    var player = r.player[0];
    var items = player.equipChipItems;
    for(var i = 0 ; i< items.length ; i++){
      var item = items[i];
      if(item.id === id){
        items[i].num = num;
      }
    }
    //console.info(items);
    var opts = {"pid":pid,"player":{"equipChipItems":items}};
    dao.savePlayer(opts,function(rs){
    });
    res.send(req.body);
  });
});

router.get('/webPvalRank',function(req,res,next){
    var svrName = req.query.svrName;
    if(svrName == undefined){
        svrName = "";
    }
    combatPvalMgr.webCombatPvalRank(svrName,function(rankList){
        res.send(rankList);
    });
});

module.exports = router;
