/**
 * Created by easy8in on 16/8/19.
 */
var Handler = function(){
};

var targetTextMgr = module.exports = Handler;
var fs = require('fs');
var path = require('path');

targetTextMgr.writeList = function(fileName,list,callback){
    //console.info(__dirname);
    //fs.exists(__dirname + '/' + fileName,function(exists){
    //    var retTxt = exists ? retTxt = '文件存在' : '文件不存在';
    //    console.log(retTxt);
    //});
    var data = "";
    for(var i=0;i<list.length;i++){
        var item = list[i];
        data += "兑换 key:"+item.key + "    " + "有效时间至:"+item.end +"\r\n";
    }
    //callback(data);
    fs.writeFile(__dirname + '/' + fileName, data, function (err) {
        if(err){
            console.log(err);
        }else{
            callback(fileName);
        }
    });
};