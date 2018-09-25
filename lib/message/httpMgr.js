/**
 * Created by easy8in on 16/10/27.
 */
var Handler = function(){
};

var httpMgr = module.exports = Handler;

httpMgr.post = function(url,data,fn){
      data=data||{};
      var content=require('querystring').stringify(data);
      var parse_u=require('url').parse(url,true);
      var isHttp=parse_u.protocol=='http:';
      var options={
           host:parse_u.hostname,
           port:parse_u.port||(isHttp?80:443),
           path:parse_u.path,
           method:'POST',
           headers:{
                  'Content-Type':'text/json',
                  'Content-Length':content.length
            }
        };
        var req = require(isHttp?'http':'https').request(options,function(res){
          var _data='';
          res.on('data', function(chunk){
             _data += chunk;
          });
          res.on('end', function(){
                fn!=undefined && fn(_data);
           });
        });
        req.write(content);
        req.end();
}