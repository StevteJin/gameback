var base64String = module.exports;

base64String.encodingBase64String = function(str){
    var normalStr = new Buffer(str.toString());
    var base64Str = normalStr.toString('base64');
    return base64Str;
};

base64String.decodingBase64String = function(str64){
    var base64Str = new Buffer(str64,'base64');
    var normalStr = base64Str.toString();
    return normalStr;
};