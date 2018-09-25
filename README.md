#ShjWebSvr VNtoor1200

GooglePlay 地址:
https://play.google.com/store/apps/details?id=com.gamelumi.lumi.tv

世界BOSS修改后的接口
1.测试的时候 http://121.42.145.54:3030/timer/refreshBoss?time=02:25
   指定BOSS 开启时间
2.获取BOSS信息接口 reqBossInfo 返回监听 onReqBoss
   {"id":404,"startTime":1463077500,"lv":1,"hp":1000000,"chp":1000000,"Countdown":108}
   id：怪物id startTime：开启时间戳 lv：等级 hp：怪物血量 chp：当前血量 Countdown：
   倒计时单位秒
3.攻击BOSS接口 attackBoss 返回监听 onAttakedBoss
   {"id":404,"startTime":1463077500,"lv":1,"hp":1000000,"chp":999990}
4.获取排行总伤害提供新的接口 计分板 bossScore 返回监听 onBossScore
   {"px":[{"nickName":"test1","attack":"10","num":1}],"cNum":1,"attack":"10"}
  px 是排行 cNum 是自己的排名 attack 自己的总伤害

流程：在wroldMap 中 调用 reqBossInfo 接口获取BOSS 信息 以及倒计时,
Countdown > 60*5 worldMap 显示未开启
Countdown <= 60*5 worldMap 显示可进入
进入BOSS Scene后 继续倒计时至BOSS 开启后 发起攻击
监听攻击后的返回BOSS 当前血量为0后 世界BOSS 结束 worldMap显示已结束
调用 bossScore 获取计分板排名
情况1.未发起攻击，调用bossScore ，排行数组length=0 cNum=1 attack =null
情况2.boss开启时间未到，调用attackBoss接口，不会做计分板，返回BOSS 信息不会变化
情况3.不调用http://121.42.145.54:3030/timer/refreshBoss?time=02:25&hp=100 指定开启时间，服务器调度任务默认早上5点自动配置开启时间为12：00。
奖励，未完待续！


http://shjsvr.raytheongame.com:3030/ 域名访问地址


战力接口
上传战力:
combatPval  返回监听 combatPval
参数
  pid;//玩家 ID
   hp;//生命值
   mp;//魔法值
   assault;//攻击
   defense;//防御
   tempo;//速度
   hitRate;//命中率
   dodgeRate;//闪避
   critRate;//暴率
   critHarm;//暴伤
   stunRate;//击晕
   combatPowerVal;//战力值
返回 JSON
{ hp: 6133,
  mp: 82,
  assault: 210,
  defense: 67,
  tempo: 820,
  hitRate: 92.12,
  dodgeRate: 5.5,
  critRate: 5,
  critHarm: 160,
  stunRate: 2,
  combatPowerVal: 6000 }

战力排行 :
combatPvalRank 返回监听 combatPvalRank
参数 : cpval(战力值)
返回JSON:
{ cpval: 6600,
  crank: 1,
  rankList:
   [ { nickName: '萧秋', svr_combat: [Object] },
     { nickName: '萧厉', svr_combat: [Object] } ] }
cpval 为请求战力榜的玩家战力值
crank 为请求战力榜的玩家战力排名
rankList 为战力排行榜
svr_combat = {"hp":6133,"mp":82,"assault":210,"defense":67,"tempo":820,"hitRate":92.12,"dodgeRate":5.5,"critRate":5,"critHarm":160,"stunRate":2,"combatPowerVal":6600}

重复登录:
1先绑定设备
接口: bindEquipment 参数 pid eid(pid玩家 id|eid 设备ID)
返回监听  bindSuccess 绑定成功 | bindFail 绑定失败
2.检测绑定 没隔一段时间访问
接口:repeatEquipment 参数 pid eid
返回监听
onUnique 当前设备为唯一登录设备
onRepeat 该设备为重复登录设备 返回JSON {"eid" : "EID123","timestamp" : 1468260078}
                                    eid 新绑定的设备id timestamp绑定时间

竞技场排行榜
arenaRank 参数 pid start end (pid 玩家 id, start 开始排名 end 结束排名)
例如 获取排名 1 到 10的玩家  start=1 end =10 获取 50 到100 start=50 end=100
返回监听 onArenaRank
返回 json
{"currRank":"1000+","rankList":[{"_id":"57889dc9e72267b604adcd8b","role":{"id":10002,"lv":23,"startLevTime":0,"eState":2,"useExec":1},"svr_arenaRank":1,"nickName":"Arena_50"},{"_id":"57889dc9e72267b604adcd5b","role":{"id":10001,"lv":24,"startLevTime":0,"eState":2,"useExec":1},"svr_arenaRank":2,"nickName":"Arena_2"},{"_id":"57889dc9e72267b604adcd5c","role":{"id":10002,"lv":27,"startLevTime":0,"eState":2,"useExec":1},"svr_arenaRank":3,"nickName":"Arena_3"}]}

获取推荐玩家
arenaListPlayer 参数 pid
返回监听 onArenaListPlayer
返回 json
[{"_id":"57963d5f6db1aede0867aa10","role":{"id":10001,"lv":29,"startLevTime":0,"eState":1,"useExec":1},"currentEquips":[1024,1025,1026,1027,1028,1029],"currentEquips2":[1000,1001,1002,1003,1004,1005],"currentFashion":[0,0,0,0,0,0],"isFashion":false,"isEquip2":false,"svr_arenaRank":5,"nickName":"程驳"},{"_id":"57963d5f6db1aede0867aa12","role":{"id":10002,"lv":6,"startLevTime":0,"eState":1,"useExec":8},"currentEquips":[1078,1079,1080,1081,1082,1083],"currentEquips2":[1000,1001,1002,1003,1004,1005],"currentFashion":[0,0,0,0,0,0],"isFashion":false,"isEquip2":false,"svr_arenaRank":4,"nickName":"孟雁开"},{"_id":"5797306282dd16a62f28140d","role":{"id":10002,"lv":96,"startLevTime":1469700814,"eState":3,"useExec":28},"currentEquips":[1144,1145,1146,1147,1148,1149],"currentEquips2":[1078,1079,1080,1081,1082,1083],"currentFashion":[1150,1151,1152,1153,1154,1155],"isFashion":false,"isEquip2":false,"nickName":"宫太清","svr_arenaRank":3,"svr_combat":{"hp":30628,"mp":400,"assault":2333,"defense":612,"tempo":113920,"hitRate":9983,"dodgeRate":3075,"critRate":2070,"critHarm":18180,"stunRate":2590,"combatPowerVal":118819,"m1cpv":1127,"m2cpv":13913,"m3cpv":5416}}]

挑战结算
arenaScore
参数 pid(值是玩家ID) vsPid(被挑战者玩家ID) score(win|lose 字符串 win是挑战成功 lose是挑战失败)
返回监听 onArenaScore
返回 json attacker攻击者 defense防守者 winer(attacker攻击者胜利|defense防守者胜利)timestmp时间戳
{"attacker":{"nickName":"萧秋","currentEquips":[1000,1001,1002,1003,1004,1005],"currentEquips2":[1000,1001,1002,1003,1004,1005],"currentFashion":[0,0,0,0,0,0],"isFashion":false,"isEquip2":false,"svr_arenaRank":1001},
"defense":{"nickName":"萧碧","currentEquips":[1018,1019,1020,1021,1022,1023],"currentEquips2":[1000,1001,1002,1003,1004,1005],"currentFashion":[0,0,0,0,0,0],"isFashion":false,"isEquip2":false,"svr_arenaRank":984},
"winer":"defense",
"timestmp":1470205036}

挑战日志
araneLogs
参数 pid
返回监听
onArenaLogs
返回json
[{"attacker":{"nickName":"萧碧","currentEquips":[1018,1019,1020,1021,1022,1023],"currentEquips2":[1000,1001,1002,1003,1004,1005],"currentFashion":[0,0,0,0,0,0],"isFashion":false,"isEquip2":false,"svr_arenaRank":984},"defense":{"nickName":"萧秋","currentEquips":[1000,1001,1002,1003,1004,1005],"currentEquips2":[1000,1001,1002,1003,1004,1005],"currentFashion":[0,0,0,0,0,0],"isFashion":false,"isEquip2":false,"svr_arenaRank":1001},"winer":"attacker","timestmp":1470202891},{"attacker":{"nickName":"萧碧","currentEquips":[1018,1019,1020,1021,1022,1023],"currentEquips2":[1000,1001,1002,1003,1004,1005],"currentFashion":[0,0,0,0,0,0],"isFashion":false,"isEquip2":false,"svr_arenaRank":984},"defense":{"nickName":"萧秋","currentEquips":[1000,1001,1002,1003,1004,1005],"currentEquips2":[1000,1001,1002,1003,1004,1005],"currentFashion":[0,0,0,0,0,0],"isFashion":false,"isEquip2":false,"svr_arenaRank":1001},"winer":"defense","timestmp":1470202962},{"attacker":{"nickName":"萧秋","currentEquips":[1000,1001,1002,1003,1004,1005],"currentEquips2":[1000,1001,1002,1003,1004,1005],"currentFashion":[0,0,0,0,0,0],"isFashion":false,"isEquip2":false,"svr_arenaRank":1001},"defense":{"nickName":"萧碧","currentEquips":[1018,1019,1020,1021,1022,1023],"currentEquips2":[1000,1001,1002,1003,1004,1005],"currentFashion":[0,0,0,0,0,0],"isFashion":false,"isEquip2":false,"svr_arenaRank":984},"winer":"defense","timestmp":1470202991}]

签到奖励 signConfig
返回监听 onSignConfig

道具产出 propsOut(所有道具的产出 如:邮件获得,通关,购买,转换等)
参数:{"pid":"576aa6d9ace0470e3277cb2e","nickName":"萧秋","propsId":"3001","propsName":"钻石","count":30};
返回监听 onPropsOut
{"props":{"pid":"576aa6d9ace0470e3277cb2e","nickName":"萧秋","propsId":"3001","propsName":"钻石","count":30,"timestamp":1470586664,"_id":"57a75f286e5fbb0921391e3a"}}

道具消耗 propsUse(所有道具的消耗 如:强化,购买,转换,使用等)
参数:{"pid":"576aa6d9ace0470e3277cb2e","nickName":"萧秋","propsId":"3001","propsName":"钻石","count":30};
返回监听 onPropsUse
{"props":{"pid":"576aa6d9ace0470e3277cb2e","nickName":"萧秋","propsId":"3001","propsName":"钻石","count":30,"timestamp":1470586664,"_id":"57a75f286e5fbb0921391e3a"}}

竞技场奖励 一共2种 一次性奖励通过邮件发放.
每日挑战结算奖励用以下接口
Step:1
是否结算接口 settleArenaAward
返回监听 onSettleArenaAward
返回 json {"settle":1} settle =1 已经结算 settle = 0 未结算
settle = 1 next ->
Step:2
获取结算结果 arenaAward
参数 pid
返回监听 onArenaAward
返回 json
{"rewardList":"","count":""}//没有奖励
{"rewardList":"3000,3001,3005","count":"28000,80,560"} //有奖励
有奖励 next ->
Step:3
确定领取接口 realArenaAward
参数 pid
返回监听 onRealArenaAward
返回 json {"success":1}
success = 1 客户端添加 Step2 返回的结构
success = 0 (可能重复领取,可能过时间了) 重新 Step1 -> Step2


兑换券接口
useKey
参数  pid | key 返回监听 onUseKey
返回 json
{"code":val}
val = 1 已使用
val = 2 已过期
val = 3 无效
val = 200 成功 等待邮件

修改所有排名
db.getCollection('player').update({"svr_arenaRank":{$gt:-1}},{$set:{"svr_arenaRank":0}},false,true)
删除所有僵尸号
db.getCollection('player').remove({"uid":"arenaplayer"})
检查僵尸号是否所有都建成
db.getCollection('player').find({"uid":"arenaplayer"}).count()