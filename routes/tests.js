/**
 * Created by easy8in on 16/3/15.
 */
var express = require('express');
var router = express.Router();
var util = require('util');
var _ = require("underscore")._;
var async = require("async");
var base64String = require("./../lib/consts/base64String");
var broadcastDao = require("./../lib/dao/broadcastDao");
var mailDao = require("./../lib/dao/mailDao");
var userDao = require("./../lib/dao/userDao");
var playerDao = require("./../lib/dao/playerDao");
var mailboxMgr = require("./../lib/message/mailBoxMgr");
var timeMgr = require("./../lib/message/timeMgr");
var confMgr = require("./../lib/message/confMgr");
var bossMgr = require("./../lib/message/bossMgr");
var lumiMgr = require("./../lib/message/lumiMgr");
var statisticMgr = require("./../lib/message/statisticMgr");
var combatPvalMgr = require("./../lib/message/combatPvalMgr");
var versionMgr = require("./../lib/message/versionMgr");
var playerMgr = require("./../lib/message/playerMgr");
var reward  = require("./../conf/BossAwardConfig.json");
var auDao = require("./../lib/dao/auDao");
var lumiPrice = require('./../conf/lumiPrice.json');
var propsMgr = require("./../lib/message/propsMgr");
var propsKeyMgr = require("./../lib/message/propsKeyMgr");
var adminMgr = require("./../lib/message/adminMgr");
var svrMgr = require("./../lib/message/svrMgr");
var passRankMgr = require("./../lib/message/passRankMgr");
var retentionDao = require("./../lib/dao/retentionDao");
var language  = require("./../lib/consts/language");
var httpMgr = require("./../lib/message/httpMgr");
var IAPMgr = require("./../lib/message/IAPMgr");
var asdkMgr = require("./../lib/message/asdkMgr");
var emailMgr = require("./../lib/message/emailMgr");
var controller = require("./../lib/controller/controller");

var section = require('./../conf/SectionConfig.json');

/* GET tests listing. */
/* TEST URL */
//http://127.0.0.1:3030/tests

router.get('/', function(req, res, next) {
    //emailMgr.sendMail("784626256@qq.com","123");
    //res.send("123");
    svrMgr.findSvrList({},function(list){
        res.send(list);
    });
});

router.get('/testvser',function(req,res,next){
    var platform = "appstore";
        if(platform === "appstore"){
            versionMgr.currVersionIOS(function(v){
                res.send(v);
                });
        }else{
            versionMgr.currVersion(function(v){
                res.send(v);
                });
        }
});

router.get('/testIAP',function(req,res,next){
    // var pid = "5813049cb9df8de964da1ad6";
    // var transaction_id = "1000000245955027";
    // IAPMgr.verifyReceipt(pid,transaction_id,receipt);
    var receipt = "ewoJInNpZ25hdHVyZSIgPSAiQXh5YXZNbURzaEV2ODcyRExxS2c4NkFJMU01ZS9NZFdUKzZzckNNSHBHS04zbzhraUFHNytlVnlJVG9MUFY3THRWNm1WdFl6M1kwMTdMb1UvYWJRbk4yS3JaTVpabDVRM2ZxaXBXOCt2Z2p3RnRLR2hNbEkyekNWS2h4cTZlT0x2VEtaTjZsRStDUTlkY1Rsa1l1UlRlenQ1OWlhWDYwenJnSHJ5UkxiY3ZzVUNjQ2tZSnQwbFZDeDlOL3JEbytQS2VpM0NYRkNKek9rbVl1YWl0b1MwU0QwYVRIOG5IaEhzaFQvRWRoTzJOM0tRY3IyQXlkaUc5bXByYVB0M21HNTdKQXBKTDN5TnNpQlVZa1IvbXlRby9UbmlWRG9zVFNSYWpLRlVKWFJSVyt2M1NIWDB4REtZMUhTQ05OclJLUUo4UXNpZlZJaisyN0ZtRFErZXJMQXdUNEFBQVdBTUlJRmZEQ0NCR1NnQXdJQkFnSUlEdXRYaCtlZUNZMHdEUVlKS29aSWh2Y05BUUVGQlFBd2daWXhDekFKQmdOVkJBWVRBbFZUTVJNd0VRWURWUVFLREFwQmNIQnNaU0JKYm1NdU1Td3dLZ1lEVlFRTERDTkJjSEJzWlNCWGIzSnNaSGRwWkdVZ1JHVjJaV3h2Y0dWeUlGSmxiR0YwYVc5dWN6RkVNRUlHQTFVRUF3dzdRWEJ3YkdVZ1YyOXliR1IzYVdSbElFUmxkbVZzYjNCbGNpQlNaV3hoZEdsdmJuTWdRMlZ5ZEdsbWFXTmhkR2x2YmlCQmRYUm9iM0pwZEhrd0hoY05NVFV4TVRFek1ESXhOVEE1V2hjTk1qTXdNakEzTWpFME9EUTNXakNCaVRFM01EVUdBMVVFQXd3dVRXRmpJRUZ3Y0NCVGRHOXlaU0JoYm1RZ2FWUjFibVZ6SUZOMGIzSmxJRkpsWTJWcGNIUWdVMmxuYm1sdVp6RXNNQ29HQTFVRUN3d2pRWEJ3YkdVZ1YyOXliR1IzYVdSbElFUmxkbVZzYjNCbGNpQlNaV3hoZEdsdmJuTXhFekFSQmdOVkJBb01Da0Z3Y0d4bElFbHVZeTR4Q3pBSkJnTlZCQVlUQWxWVE1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBcGMrQi9TV2lnVnZXaCswajJqTWNqdUlqd0tYRUpzczl4cC9zU2cxVmh2K2tBdGVYeWpsVWJYMS9zbFFZbmNRc1VuR09aSHVDem9tNlNkWUk1YlNJY2M4L1cwWXV4c1FkdUFPcFdLSUVQaUY0MWR1MzBJNFNqWU5NV3lwb041UEM4cjBleE5LaERFcFlVcXNTNCszZEg1Z1ZrRFV0d3N3U3lvMUlnZmRZZUZScjZJd3hOaDlLQmd4SFZQTTNrTGl5a29sOVg2U0ZTdUhBbk9DNnBMdUNsMlAwSzVQQi9UNXZ5c0gxUEttUFVockFKUXAyRHQ3K21mNy93bXYxVzE2c2MxRkpDRmFKekVPUXpJNkJBdENnbDdaY3NhRnBhWWVRRUdnbUpqbTRIUkJ6c0FwZHhYUFEzM1k3MkMzWmlCN2o3QWZQNG83UTAvb21WWUh2NGdOSkl3SURBUUFCbzRJQjF6Q0NBZE13UHdZSUt3WUJCUVVIQVFFRU16QXhNQzhHQ0NzR0FRVUZCekFCaGlOb2RIUndPaTh2YjJOemNDNWhjSEJzWlM1amIyMHZiMk56Y0RBekxYZDNaSEl3TkRBZEJnTlZIUTRFRmdRVWthU2MvTVIydDUrZ2l2Uk45WTgyWGUwckJJVXdEQVlEVlIwVEFRSC9CQUl3QURBZkJnTlZIU01FR0RBV2dCU0lKeGNKcWJZWVlJdnM2N3IyUjFuRlVsU2p0ekNDQVI0R0ExVWRJQVNDQVJVd2dnRVJNSUlCRFFZS0tvWklodmRqWkFVR0FUQ0IvakNCd3dZSUt3WUJCUVVIQWdJd2diWU1nYk5TWld4cFlXNWpaU0J2YmlCMGFHbHpJR05sY25ScFptbGpZWFJsSUdKNUlHRnVlU0J3WVhKMGVTQmhjM04xYldWeklHRmpZMlZ3ZEdGdVkyVWdiMllnZEdobElIUm9aVzRnWVhCd2JHbGpZV0pzWlNCemRHRnVaR0Z5WkNCMFpYSnRjeUJoYm1RZ1kyOXVaR2wwYVc5dWN5QnZaaUIxYzJVc0lHTmxjblJwWm1sallYUmxJSEJ2YkdsamVTQmhibVFnWTJWeWRHbG1hV05oZEdsdmJpQndjbUZqZEdsalpTQnpkR0YwWlcxbGJuUnpMakEyQmdnckJnRUZCUWNDQVJZcWFIUjBjRG92TDNkM2R5NWhjSEJzWlM1amIyMHZZMlZ5ZEdsbWFXTmhkR1ZoZFhSb2IzSnBkSGt2TUE0R0ExVWREd0VCL3dRRUF3SUhnREFRQmdvcWhraUc5Mk5rQmdzQkJBSUZBREFOQmdrcWhraUc5dzBCQVFVRkFBT0NBUUVBRGFZYjB5NDk0MXNyQjI1Q2xtelQ2SXhETUlKZjRGelJqYjY5RDcwYS9DV1MyNHlGdzRCWjMrUGkxeTRGRkt3TjI3YTQvdncxTG56THJSZHJqbjhmNUhlNXNXZVZ0Qk5lcGhtR2R2aGFJSlhuWTR3UGMvem83Y1lmcnBuNFpVaGNvT0FvT3NBUU55MjVvQVE1SDNPNXlBWDk4dDUvR2lvcWJpc0IvS0FnWE5ucmZTZW1NL2oxbU9DK1JOdXhUR2Y4YmdwUHllSUdxTktYODZlT2ExR2lXb1IxWmRFV0JHTGp3Vi8xQ0tuUGFObVNBTW5CakxQNGpRQmt1bGhnd0h5dmozWEthYmxiS3RZZGFHNllRdlZNcHpjWm04dzdISG9aUS9PamJiOUlZQVlNTnBJcjdONFl0UkhhTFNQUWp2eWdhWndYRzU2QWV6bEhSVEJoTDhjVHFBPT0iOwoJInB1cmNoYXNlLWluZm8iID0gImV3b0pJbTl5YVdkcGJtRnNMWEIxY21Ob1lYTmxMV1JoZEdVdGNITjBJaUE5SUNJeU1ERTJMVEV3TFRNd0lESXhPalUzT2pNeElFRnRaWEpwWTJFdlRHOXpYMEZ1WjJWc1pYTWlPd29KSW5WdWFYRjFaUzFwWkdWdWRHbG1hV1Z5SWlBOUlDSmxNMlU0TXpaaVlqY3hNRGd6WXpGa09UQXpNRFJtWkRCalpXWmtOREJoTmpabVl6UmxOVFl5SWpzS0NTSnZjbWxuYVc1aGJDMTBjbUZ1YzJGamRHbHZiaTFwWkNJZ1BTQWlNVEF3TURBd01ESTBOakkxT1RjeE55STdDZ2tpWW5aeWN5SWdQU0FpTUNJN0Nna2lkSEpoYm5OaFkzUnBiMjR0YVdRaUlEMGdJakV3TURBd01EQXlORFl5TlRrM01UY2lPd29KSW5GMVlXNTBhWFI1SWlBOUlDSXhJanNLQ1NKdmNtbG5hVzVoYkMxd2RYSmphR0Z6WlMxa1lYUmxMVzF6SWlBOUlDSXhORGMzT0RnNU9EVXhPREUwSWpzS0NTSjFibWx4ZFdVdGRtVnVaRzl5TFdsa1pXNTBhV1pwWlhJaUlEMGdJa0pFUkRFMVJVSXdMVGd6UkRNdE5FRXdOeTA1TlRBNUxURTRORFJFUWtRMVJqUTVPQ0k3Q2draWNISnZaSFZqZEMxcFpDSWdQU0FpZEhaME15NDVPU0k3Q2draWFYUmxiUzFwWkNJZ1BTQWlNVEUyTXpVNU1UZzJOaUk3Q2draVltbGtJaUE5SUNKamIyMHVaMkZ0Wld4MWJXa3ViSFZ0YVM1MGRpSTdDZ2tpY0hWeVkyaGhjMlV0WkdGMFpTMXRjeUlnUFNBaU1UUTNOemc0T1RnMU1UZ3hOQ0k3Q2draWNIVnlZMmhoYzJVdFpHRjBaU0lnUFNBaU1qQXhOaTB4TUMwek1TQXdORG8xTnpvek1TQkZkR012UjAxVUlqc0tDU0p3ZFhKamFHRnpaUzFrWVhSbExYQnpkQ0lnUFNBaU1qQXhOaTB4TUMwek1DQXlNVG8xTnpvek1TQkJiV1Z5YVdOaEwweHZjMTlCYm1kbGJHVnpJanNLQ1NKdmNtbG5hVzVoYkMxd2RYSmphR0Z6WlMxa1lYUmxJaUE5SUNJeU1ERTJMVEV3TFRNeElEQTBPalUzT2pNeElFVjBZeTlIVFZRaU93cDkiOwoJImVudmlyb25tZW50IiA9ICJTYW5kYm94IjsKCSJwb2QiID0gIjEwMCI7Cgkic2lnbmluZy1zdGF0dXMiID0gIjAiOwp9";
    ves(receipt,false,function(chunk){
        res.send(chunk);
    });
});

var https = require('https');
function ves(receiptData_base64, production, cb)
{
    var url = production ? 'buy.itunes.apple.com' : 'sandbox.itunes.apple.com'
    var receiptEnvelope = {
        "receipt-data": receiptData_base64
    };
    var receiptEnvelopeStr = JSON.stringify(receiptEnvelope);
    var options = {
        host: url,
        port: 443,
        path: '/verifyReceipt',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(receiptEnvelopeStr)
        }
    };

    var req = https.request(options, function(res) {
        res.setEncoding('utf8');
        var _data='';
        res.on('data', function (chunk) {
            // console.log("body: " + chunk);
            // cb(true, chunk);
            _data +=chunk;
        });
        res.on('end', function(){
                cb!=undefined && cb(_data);
           });
        res.on('error', function (error) {
            console.log("error: " + error);
            cb(false, error);
        });
    });
    req.write(receiptEnvelopeStr);
    req.end();
}

router.get('/testPass',function(req,res,next){
    res.send(base64String.encodingBase64String("123456"));
});

router.get('/testHtml',function(req,res,next){
    httpMgr.post('http://127.0.0.1:3088/tests/testPost',{"test":"timestamp"},function(data){
        res.send(data);
    });
});

router.post('/testPost',function(req,res,next){
    var opts = req.body;
    console.info(opts);
    res.send(opts);
});

router.get('/clean',function(req,res,next){
    //db.getCollection('player').update({"svrName":"测试服","svr_arenaRank":{$gt:0}},{$set:{"svr_arenaRank":0,"svr_arenaLogs":[],"svr_arenaRankLogs":[],"svr_arenaLastRank":0}},false,true)
    // var dao = new playerDao();
    // dao.cleanAranaRank("测试服",function(rs){
    //     res.send(rs);
    // });
    playerMgr.arenaInitPlayer("Vùng Thánh Võ","VN");
    res.send("Successfully");
});

//web查看玩家战斗力排行
router.get('/webPvalRank',function(req,res,next){
    combatPvalMgr.webCombatPvalRank("测试服",function(rankList){
        res.send(rankList);
    });
});

router.get('/pushProps2AllPlayer',function(req,res,next){
    var dao = new playerDao();
    var query = {"uid":{$ne:"arenaplayer"}};
    dao.findAllPlayer(query,"nickName",function(rs){
        var list = rs.items;
        for (var i = 0;i<list.length;i++) {
            var player = list[i];
            var mail = {"pid":player._id + "","theme":"","content":"Server đã kết thúc bảo trì, thống nhất phát quà bảo trì.","rewardList":"6,3001","count":"100,3000","from":"GM"};
            var mDao = new mailDao();
            mDao.sendMailToPlayer(mail,function(){
            });
        }
        console.info("push end!");
    });
    res.send("end");
});

function GetArrRandomNum(len,wid){
    var Arr = [];
    var inx = 0;
    var start = 1;
    var end = 1000;
    if(wid > 350){
        start = ((wid - 200) > 0) ? wid - 200 : 1;
        end = wid;
    }else if(wid > 3){
        var bnum = parseInt(wid /10);
        var tmp = (bnum -2) > 0 ? bnum - 2 : 1;
        var ar = tmp * 6;
        start = wid - ar > 0 ? wid - ar : 1;
        end = wid;
    }else{
        start = 1;
        end = 4;
    }
    while(true){
        var rnum = GetRandomNum(start,end);
        if(!_.contains(Arr, rnum) && rnum != wid){
            Arr.push(rnum);
            ++inx;
        }
        if(inx > len - 1){
            break;
        }
    }
    Arr.sort(function(a,b){
        return a-b});
    return Arr;
}
function GetExp(val,val1){
    return parseInt(val/val1);
}

function GetRandomNum(Min,Max) {
    return parseInt(Math.random()*(Max - Min + 1) + Min);
}

function lumiPriceInfo(gold){
    var orderInfo = undefined;
    for(var key in lumiPrice){
        var info = lumiPrice[key];
        if(info.Count === gold){
            orderInfo = info;
        }
    }
    return orderInfo;
}


router.get('/addCpval', function(req, res, next) {
    var opts = {"pid":"5761369dd71bc0ec5262b5bf"};
    opts.hp = 6133;
    opts.mp = 82;//魔法值
    opts.assault = 210;//攻击
    opts.defense = 67;//防御
    opts.tempo = 820;//速度
    opts.hitRate = 92.12;//命中率
    opts.dodgeRate = 5.5;//闪避
    opts.critRate = 5;//暴率
    opts.critHarm = 160;//暴伤
    opts.stunRate = 2;//击晕
    opts.combatPowerVal = 6000;//战力值
    combatPvalMgr.addCombatPval(opts,function(cpval){
        console.info(cpval);
        res.send("Successfully!");
    });
});

router.get('/sign', function(req, res ,next){
    var rt = lumiMgr.testSign("488920","","anonymous488920","","1465809182","bea7528b3c8db288a6e22ab7ce256003");
    console.info(rt);
    res.send("Successfully!");
});

router.get('/profile',function(req, res, next){
    statisticMgr.profile(function(r){
        console.info(r);
    });
    res.send("Successfully!");
});

router.get('/realTime',function(req, res, next){
    statisticMgr.realTime(function(r){
       console.info(r);
    });
    res.send("Successfully!");
});

router.get('/refLog',function(req,res,next){
    var dao = new auDao();
    dao.refreshLogs('575a761085813ca52db8a8f3',function(r){
    });
    res.send("Successfully");
});

router.get('/dauTime',function(req, res, next){
    var dao = new auDao();
    dao.DAUTimeSum(function(r){
        res.send(r);
    });
});

router.get('/dau',function(req, res, next){
    var dao = new auDao();
    dao.DAU(function(r){
        res.send(r);
    });
});

router.get('/wau',function(req, res, next){
    var dao = new auDao();
    dao.WAU(function(r){
        res.send(r);
    });
});

router.get('/mau',function(req, res, next){
    var dao = new auDao();
    dao.MAU(function(r){
        res.send(r);
    });
});

router.get('/testTimeStamp',function(req,res,next){
    res.send("timestam:" + timeMgr.getTodayZeroTimestamp());
});

router.get('/testBossRewardList',function(req,res,next){
    bossMgr.RewardList(function(rl){
        res.send(rl);
    });
});

router.get('/testBossReward',function(req,res,next){
    var num =parseInt(req.query.num);
    var r =undefined;
    var eMax = reward[reward.length -1];
    if(num >= eMax.Min){
        r = [eMax];
    }else{
        r = _.filter(reward, function(rwd){
            if(rwd.Max >= num && num >= rwd.Min){
                return rwd;
            }
        });
    }
    res.send(formatReward(r[0]));
});

function formatReward(tr){
    var rs = {"Name":tr._id,"rewadList":"","count":""};
    var rewardListStr = "";
    var countStr = "";
    if(tr.ID1 > 0 && tr.Number1 > 0){
        rewardListStr += tr.ID1 + ",";
        countStr += tr.Number1 + ",";
    }
    if(tr.ID2 > 0 && tr.Number2 > 0){
        rewardListStr += tr.ID2 + ",";
        countStr += tr.Number2 + ",";
    }
    if(tr.ID3 > 0 && tr.Number3 > 0){
        rewardListStr += tr.ID3 + ",";
        countStr += tr.Number3 + ",";
    }
    if(tr.ID4 > 0 && tr.Number4 > 0){
        rewardListStr += tr.ID4 + ",";
        countStr += tr.Number4 + ",";
    }

    if(rewardListStr.substring(rewardListStr.length-1,rewardListStr.length) === ','){
        rewardListStr = rewardListStr.substring(0,rewardListStr.length - 1);
    }
    if(countStr.substring(countStr.length-1,countStr.length) === ','){
        countStr = countStr.substring(0,countStr.length - 1);
    }

    rs.rewadList = rewardListStr;
    rs.count = countStr;
    return rs;
}

router.get('/testBossScore',function(req,res,next){
    var pid = req.query.pid;
    var nickName = req.query.nickName;
    var opts = {"pid":pid,"nickName":nickName};
    bossMgr.ScorePlan(opts,function(scorePlan){
        res.send(scorePlan);
    });
});

router.get('/testBoss',function(req,res,next){
    var time = req.query.time;
    /*
     bossMgr.initBoss(time,function(bossInfo){
     res.send(bossInfo);
     });
     */
    bossMgr.reqBossInfo(function(boss){
        res.send(boss);
    });
});

router.get('/testAttackBoss',function(req,res,next){
    var pid = req.query.pid;
    var nickName = req.query.nickName;
    var attack = parseInt(req.query.attack);
    var opts = {"pid":pid,"nickName":nickName,"attack":attack};
    bossMgr.attackBoss(opts,function(boss){
        if (boss.hp > 0) {
            res.send("袭击:" + JSON.stringify(boss));
        } else {
            res.send("击杀:" + JSON.stringify(boss));
        }
    });
});

router.get('/testPR',function(req,res,next){
    var txt = "洋";
    var dao = new playerDao();
    dao.regexFindPlayer(txt,function(r){
        res.send(r.items);
    });
});

router.get('/testRandomPlayer',function(req,res,next){
    var opts = {"pid" : "576aa6d9ace0470e3277cb2e" ,"uid" : "576aa6baace0470e3277cb2d"};
    var dao = new playerDao();
    dao.randomPlayer(opts,function(r){
        res.send(r.nickName);
    });
});

router.get('/testMercenaryConfig',function(req,res,next){
    confMgr.MercenaryConfig({},function(r){
        res.send(r);
    });
});

router.get('/testEctypeConfig',function(req,res,next){
    confMgr.EctypeConfig({},function(r){
        res.send(r);
    });
});

router.get('/testBossConfig',function(req,res,next){
    confMgr.BossConfig({},function(r){
        res.send(r);
    });
});

router.get('/testDropoutConfig',function(req,res,next){
    confMgr.DropoutConfig({},function(r){
        res.send(r);
    });
});

router.get('/testEpxConfg',function(req,res,next){
    confMgr.EpxConfg({},function(r){
        res.send(r);
    });
});

router.get('/testMainichiConfig',function(req,res,next){
    confMgr.MainichiConfig({},function(r){
        res.send(r);
    });
});

router.get('/testMoment',function(req,res,next){
    var date1 = new Date("2016-03-13 21:00:00");
    var time1 = Date.parse(date1) / 1000;
    console.info(time1);

    var timestamp = 1457874000;
    var td = timeMgr.isToday(timestamp);//是否当天连续登录
    var sl = timeMgr.isSuccessiveLogin(timestamp);//是否每天连续登录

    if(td){
        res.send("当前连续登录");
    }else{
        if(sl){
            res.send("每天连续登录");
        }else{
            res.send("连续登录1天");
        }
    }
});

router.get('/testMailBoxMgr',function(req,res,next){
    console.info("testMailBoxMgr");
    var opts = {"pid":"56cc7206bb1ee2761a327380","uid":"56cc71ffbb1ee2761a32737f"};
    mailboxMgr.getMails(opts,function(arrMsg){
        res.send(arrMsg);
    });
});

router.post('/testBroadcast', function(req, res, next) {
    console.info("POST");
    console.info(req.body);
    var broadcast = {"type":"normal","content":"普通的广播"};

    var dao = new broadcastDao();
    dao.add(broadcast,function(outs){
        if(outs.code === 200){
            res.send(outs);
        }else{
            res.send("FAIL");
        }
    });
});

router.post('/testMailToPlayer', function(req, res, next) {
    console.info("testMailToPlayer");
    console.info(req.body);
    var mail = {"pid":"57011e03fffc0d48573540ee","theme":"测试玩家邮件","content":"这一个玩家的测试邮件","rewardList":"","count":"","from":"测试组"};

    var dao = new mailDao();
    dao.sendMailToPlayer(mail,function(){
        res.send("SUCCESS");
    });
});

router.get('/testMailToPlayer', function(req, res, next) {
    console.info("testMailToPlayer");
    //console.info(req.body);
    var pid = req.query.pid;
    //var mail = {"pid":"57011e03fffc0d48573540ee","theme":"测试玩家邮件","content":"这一个玩家的测试邮件","rewardList":"","count":"","from":"测试组"};
    var mail = {"pid":pid + "","theme":"测试玩家邮件","content":"这一个玩家的测试邮件","rewardList":"","count":"","from":"测试组"};
    var dao = new mailDao();
    dao.sendMailToPlayer(mail,function(){
        res.send("SUCCESS");
    });
});

router.get('/testget',function(req,res,next){
    console.info(req.query.uid);
    res.send("1111");
});

router.post('/testMailOfAct', function(req, res, next) {
    console.info("testMailOfAct");
    console.info(req.body);
    var mail = {"theme":"测试活动邮件","content":"这是一个测试活动的邮件","rewardList":"","count":"","from":"测试组"};
        var dao = new mailDao();
        dao.sendMailOfAct(mail,function(){
        res.send("SUCCESS");
    });
});

router.post('/testloadMail', function(req, res, next) {
    console.info("testMailOfAct");
    console.info(req.body);
    var pid = "123";
    var dao = new mailDao();
    dao.loadMail(pid,function(r){
        res.send(r);
    });
});

router.get('/testInitPayer',function(req,res,next){
    var dao = new playerDao();
    dao.create({"uid":"124","playerType":"soldier","nickName":"initest2"},function(r){
        console.info(r);
        res.send(r);
    });
});

router.get('/testEPayer',function(req,res,next){
    var dao = new playerDao();
    dao.existPayer({"nickName":"initest"},function(r){
        res.send(r);
    });
});

module.exports = router;
