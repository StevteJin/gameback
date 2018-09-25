var Monogo = require("./mongodb/mongo");
var status = require('./mongodb/status');
var userEntity = require('./entites/userEntity.json');
var CONSTS = require('./../consts/consts');
var _ = require("underscore")._;
var db = new Monogo('user');

var Handler = function(){
};

Handler.prototype = {
    /*
     * @des: 创建一条记录
     * @model: 插入的记录，JSON格式的model
     * @callback：回调，返回插入成功的记录或者失败信息
     *
     * */
    register: function(opts, callback){
        var user = _.clone(userEntity);
        user.eid = opts.eid || "";
        user.username = opts.username || "";
        user.useremail = opts.useremail || "";
        user.password = opts.password || "";
        user.platform = opts.platform || "general";

        console.info(user);

        var query;
        if(user.username == "" && user.useremail ==""){
            query = {"eid" : user.eid};
        }else if(user.username == ""){
            query = {"username" : user.useremail};
        }else{
            query = {"username" : user.username};
        }

        db.read(query,function(obj){
           if(obj.status === status.success.status){
                if(obj.items.length > 0){
                    callback({code : CONSTS.ACCOUNT.ACCOUNT_EXIST});
                }else{
                    if(user.eid != "" && user.username == "" && user.useremail == ""){
                        db.create(user,function(item){
                            if(item.status === status.success.status){
                                callback({code : CONSTS.ACCOUNT.ACCOUNT_REGISTER_SUCCESS,id : item.ops[0]._id});
                            }else{
                                callback({code : CONSTS.ACCOUNT.ACCOUNT_REGISTER_FAIL});
                            }
                        });
                    }else if(user.eid == "" && (user.username != "" || user.useremail!="")){
                        db.create(user,function(item){
                            if(item.status === status.success.status){
                                callback({code : CONSTS.ACCOUNT.ACCOUNT_REGISTER_SUCCESS,id : item.ops[0]._id});
                            }else{
                                callback({code : CONSTS.ACCOUNT.ACCOUNT_REGISTER_FAIL});
                            }
                        });
                    }else{
                        db.read({"eid":user.eid},function(obj){
                            if(obj.status === status.success.status
                                && obj.items.length > 0){
                                var u = obj.items[0];
                                user.eid = "";
                                db.updateById(u._id +"",user,function(code){
                                    callback({code : CONSTS.ACCOUNT.ACCOUNT_REGISTER_SUCCESS,id : u._id});
                                });
                            }else{
                                user.eid ="";
                                db.create(user,function(item){
                                    if(item.status === status.success.status){
                                        callback({code : CONSTS.ACCOUNT.ACCOUNT_REGISTER_SUCCESS,id : item.ops[0]._id});
                                    }else{
                                        callback({code : CONSTS.ACCOUNT.ACCOUNT_REGISTER_FAIL});
                                    }
                                });
                            }
                        });
                    }
                }
           }else{
               callback({code :CONSTS.ACCOUNT.ACCOUNT_REGISTER_FAIL});
           }
        });
    },
    login : function(opts, callback){
        var username = opts.username || "";
        var useremail = opts.useremail || "";
        var password = opts.password || "";
        var eid = opts.eid || "";

        var query;
        if(username === "" && useremail === ""){
            query = {"eid" : eid};
        }else if(username != ""){
            query = {"username" : username,"password":password};
        }else if(useremail != ""){
            query = {"useremail":useremail,"password":password};
        }

        db.read(query,function(obj){
            if(obj.status === status.success.status){
                if(obj.items.length > 0){
                    var user = obj.items[0];
                    callback({code:CONSTS.ACCOUNT.ACCOUNT_LOGIN_SUCCESS,id:user._id});
                }else if(username==="" && useremail==="" && eid != ""){
                    var user = {};
                    user.username =username;
                    user.useremail = useremail;
                    user.password = password;
                    user.eid = eid;
                    db.create(user,function(item){
                        if(item.status === status.success.status){
                            callback({code : CONSTS.ACCOUNT.ACCOUNT_LOGIN_SUCCESS,id : item.ops[0]._id});
                        }else{
                            callback({code : CONSTS.ACCOUNT.ACCOUNT_REGISTER_FAIL});
                        }
                    });
                }else{
                    callback({code : CONSTS.ACCOUNT.ACCOUNT_NOT_EXIST});
                }
            }else{
                callback({code : CONSTS.ACCOUNT.ACCOUNT_LOGIN_FAIL});
            }
        });
    },
    updatePass:function(id,updateModel){
        db.updateById(id,updateModel,function(obj){
        });
    },
    findUserByMail:function(mail,callback){
        db.read({"useremail":mail},function(rs){
            callback(rs);
        });
    }
};

module.exports = Handler;