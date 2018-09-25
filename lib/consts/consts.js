module.exports = {
    EVENT :{
        NOTVALID:10000, //请求事件不存在
        NOTLOGIN : 10001//用户未登录，非法访问事件
    },
    ACCOUNT : {
        ACCOUNT_EXIST : 10002,// 注册失败：账号已经存在
        ACCOUNT_NOT_EXIST : 10003,//登录失败：帐号不存在
        ACCOUNT_PASSWORD_ERR : 10004,//登录失败：密码错误
        ACCOUNT_REGISTER_SUCCESS : 10005,//注册成功
        ACCOUNT_REGISTER_FAIL : 10006, //注册失败
        ACCOUNT_LOGIN_SUCCESS : 10007,//登录成功
        ACCOUNT_LOGIN_FAIL : 10008, //登录失败
        ACCOUNT_PASSWORD_NOTNULL : 10009, //密码不能为空
        ACCOUNT_NOTNULL:10010  //账号不能为空
    },
    AVATAR : {
        AVATAR_LIST_SUCCESS : 10011,//获取角色列表成功
        AVATAR_LIST_FAIL : 10012,//获取角色列表失败
        AVATAR_CREATE_SUCCESS:10013,//创建角色成功
        AVATAR_CREATE_FAIL : 10014,//创建角色失败
        AVATAR_SAVE_SUCCESS : 10015,//角色存档成功
        AVATAR_SAVE_FAIL : 10016,//角色存档失败
        AVATAR_LOAD_SUCCESS : 10017,//加载角色成功
        AVATAR_LOAD_FAIL : 10018,//加载角色失败,
        AVATAR_NICKNAME_EXIST : 10019,//昵称已存在
        AVATAR_NICKNAME_NOT_EXIST : 10020//昵称不存在
    },
    BOSS : {
        NOT_BOSS : 10020,
        HAS_BOSS : 10021
    }
};