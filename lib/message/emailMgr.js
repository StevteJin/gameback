/**
 * Created by easy8in on 16/3/15.
 */

var nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport');

var Handler = function(){
};

var emailMgr = module.exports = Handler;

// send mail with defined transport object
emailMgr.sendMail = function(toMail,httpGetUrl){
    var url = "http://shjsvr.raytheongame.com:3088/upass.html?link=" + httpGetUrl;

    var html = "<p><圣武战记>密码找回，若非本人操作，请勿理会!</p>";
    html +="点击<a href='" + url + "'>找回密码</a>"

    var mailOptions = {
        from: 'shengwuzhanji@foxmail.com', // 发件地址
        to: toMail, // 收件列表
        subject: '密码找回', // 标题
        text: '找回密码',
        html: html
    };

    var smtpConfig = {
        host: 'smtp.qq.com',
        port: 465,
        auth: {
            user: 'shengwuzhanji@foxmail.com',
            pass: 'ziqpljbbympqbigd'
        }
    };

    var transporter = nodemailer.createTransport(smtpTransport(smtpConfig));

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.info(error);
            return;
        }else{
            console.info('Message sent: ' + info.response);    
        }
    });
}