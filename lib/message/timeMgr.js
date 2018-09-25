/**
 * Created by easy8in on 16/3/15.
 */
var Handler = function(){
};

var timeMgr = module.exports = Handler;

timeMgr.isToday = function(timestamp){
    var date = new Date(timestamp * 1000);
    var nDate = new Date();
    return getYMD(date) === getYMD(nDate);
};

timeMgr.isSuccessiveLogin = function(loginTimestamp){
    var date = new Date(loginTimestamp * 1000);
    date.setDate(date.getDate() + 1);

    var nDate = new Date();
    return getYMD(date) === getYMD(nDate);
};

timeMgr.getTimestamp = function(){
    return Date.parse(new Date()) / 1000 ;
};

timeMgr.getTimestampOfDateStr = function(str){
    return Date.parse(new Date(str)) / 1000 ;
};

timeMgr.getTimestampOfDate = function(date){
    return Date.parse(date) / 1000 ;
};

timeMgr.getTodayDate = function(){
    return getYMD(new Date());
};

timeMgr.todayOfWeek = function(){
    var day = new Date().getDay();
    return day === 0 ? 7 : day;
};

timeMgr.getDateOfTimestamp = function(timestamp){
    return getYMD(new Date(timestamp * 1000));
};

//获取今天零点时间戳
timeMgr.getTodayZeroTimestamp = function(){
    var dayZeroStr = getYMD(new Date()) + " 00:00:00";
    var date = new Date(dayZeroStr);
    return timestamp(date);
};

timeMgr.getZeroTimestampOfYMD = function(ymd){
    var dayZeroStr = ymd + " 00:00:00";
    var date = new Date(dayZeroStr);
    return timestamp(date);
};

timeMgr.getTodayTimestampOfhms = function(hms){
    var dayZeroStr = getYMD(new Date()) + " "+hms;
    var date = new Date(dayZeroStr);
    return timestamp(date);
};

timeMgr.ymdNum  = function(){
    return getYMDNum(new Date());
};

function timestamp (date) {
    return Date.parse(date) / 1000 ;
}

function getYMD(date){
    var y = date.getFullYear();
    var m = date.getMonth() < 10 ? '0' + (date.getMonth()+1) : (date.getMonth()+1);
    var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return y + '-' + m + '-' + d;
}

function getYMDNum(date){
    var y = date.getFullYear();
    var m = date.getMonth() < 10 ? '0' + (date.getMonth()+1) : (date.getMonth()+1);
    var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return y+m+ d;
}