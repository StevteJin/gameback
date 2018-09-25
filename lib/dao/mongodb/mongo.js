/**
 * Created by easy8in on 15/12/02.
 */
var config = require('./../../../conf/dbConfig.json');
var host = config.host,
    port = config.port,
    dbName = config.dbname,
    userName = config.username,
    password = config.password,
    url = 'mongodb://' + userName + ':' + password + '@' + host +':' + port+ '/' + dbName;

var db = require('mongoskin').db(url),
    status = require('./status');
var helper = require('mongoskin').helper;

var Handler = function(collection){
    this.collection = collection;
};
Handler.prototype = {
    /*
     * @des: 创建一条记录
     * @model: 插入的记录，JSON格式的model
     * @callback：回调，返回插入成功的记录或者失败信息
     *
     * */
    create: function(model, callback){
        db.collection(this.collection).save(model, function(err, item){
            if(err) {
                return callback(status.fail);
            }
            item.status = status.success.status;
            item.message = status.success.message;
            return callback(item);
        });
    },
    /*
     * @des：读取一条记录
     * @query：查询条件，Mongo查询的JSON字面量
     * @callback：回调，返回符合要求的记录或者失败信息
     *
     * */
    read: function(query, callback){
        db.collection(this.collection).find(query).toArray(function(err, items){
            if(err){
                console.info(err);
                return callback(status.fail);
            }
            var obj = {
                status: status.success.status,
                message: status.success.message,
                items: items
            };
            return callback(obj);
        });
    },
    readRandom: function(query,skipNum,limitNum, callback){
        db.collection(this.collection).find(query).skip(skipNum).limit(limitNum).toArray(function(err, items){
            if(err){
                console.info(err);
                return callback(status.fail);
            }
            var obj = {
                status: status.success.status,
                message: status.success.message,
                items: items
            };
            return callback(obj);
        });
    },
    findById:function(id, callback){
        db.collection(this.collection).find({_id: helper.toObjectID(id)}).toArray(function(err, items){
            if(err){
                console.info(err);
                return callback(status.fail);
            }
            var obj = {
                status: status.success.status,
                message: status.success.message,
                items: items
            };
            return callback(obj);
        });
    },
    findFieldsById:function(id,attrName,callback){
        var fields = {"_id":1};
        if(attrName instanceof Array){
            for(var i = 0;i<attrName.length; i++){
                fields[attrName[i]] = 1;
            }
        }else if(typeof attrName === 'string'){
            fields[attrName] = 1;
        }

        db.collection(this.collection).find({_id: helper.toObjectID(id)},fields).toArray(function(err, items){
            if(err){
                console.info(err);
                return callback(status.fail);
            }
            var obj = {
                status: status.success.status,
                message: status.success.message,
                items: items
            };
            return callback(obj);
        });
    },
    findFieldsByQuery:function(query,attrName,sort,skipNum,limitNum,callback){
        var fields = {"_id":1};
        if(attrName instanceof Array){
            for(var i = 0;i<attrName.length; i++){
                fields[attrName[i]] = 1;
            }
        }else if(typeof attrName === 'string'){
            fields[attrName] = 1;
        }
        db.collection(this.collection).find(query,fields).sort(sort).skip(skipNum).limit(limitNum).toArray(function(err, items){
            if(err){
                console.info(err);
                return callback(status.fail);
            }
            var obj = {
                status: status.success.status,
                message: status.success.message,
                items: items
            };
            return callback(obj);
        });
    },
    findFieldsQuery:function(query,attrName,callback){
        var fields = {"_id":1};
        if(attrName instanceof Array){
            for(var i = 0;i<attrName.length; i++){
                fields[attrName[i]] = 1;
            }
        }else if(typeof attrName === 'string'){
            fields[attrName] = 1;
        }
        db.collection(this.collection).find(query,fields).toArray(function(err, items){
            if(err){
                console.info(err);
                return callback(status.fail);
            }
            var obj = {
                status: status.success.status,
                message: status.success.message,
                items: items
            };
            return callback(obj);
        });
    },
    findFieldsQuerySort:function(query,attrName,sort,callback){
        var fields = {"_id":1};
        if(attrName instanceof Array){
            for(var i = 0;i<attrName.length; i++){
                fields[attrName[i]] = 1;
            }
        }else if(typeof attrName === 'string'){
            fields[attrName] = 1;
        }
        db.collection(this.collection).find(query,fields).sort(sort).skip(0).limit(20).toArray(function(err, items){
            if(err){
                console.info(err);
                return callback(status.fail);
            }
            var obj = {
                status: status.success.status,
                message: status.success.message,
                items: items
            };
            return callback(obj);
        });
    },
    findFieldsQuerySortOfCount:function(query,attrName,sort,count,callback){
        var fields = {"_id":1};
        if(attrName instanceof Array){
            for(var i = 0;i<attrName.length; i++){
                fields[attrName[i]] = 1;
            }
        }else if(typeof attrName === 'string'){
            fields[attrName] = 1;
        }
        db.collection(this.collection).find(query,fields).sort(sort).skip(0).limit(count).toArray(function(err, items){
            if(err){
                console.info(err);
                return callback(status.fail);
            }
            var obj = {
                status: status.success.status,
                message: status.success.message,
                items: items
            };
            return callback(obj);
        });
    },
    /*
     * @des：更新一条记录
     * @query：查询条件，Mongo查询的JSON字面量，此处为_id
     * @updateModel：需要更新的JSON格式的模型
     * @callback：返回成功或者失败信息
     *
     * */
    update: function(query, updateModel, callback){
        var set = {$set: updateModel};
        db.collection(this.collection).update(query, set, function(err){
            if(err){
                return callback(status.fail);
            }else{
                return callback(status.success);
            }
        });
    },

    updateById:function(id,updateModel, callback){
        var set = {$set: updateModel};
        var query = {_id: helper.toObjectID(id)};
        db.collection(this.collection).update(query, set, function(err){
            if(err){
                return callback(status.fail);
            }else{
                return callback(status.success);
            }
        });
    },
    /*
     * @des：删除一条记录
     * @query：查询条件，Mongo查询的JSON字面量
     * @callback：返回失败或者成功的信息
     *
     * */
    del: function(query, callback){
        db.collection(this.collection).remove(query, function(err){
            if(err){
                return callback(status.fail);
            }
            return callback(status.success);
        });
    },
    delById : function(id,callback){
        var query = {_id: helper.toObjectID(id)};
        db.collection(this.collection).remove(query, function(err){
            if(err){
                return callback(status.fail);
            }
            return callback(status.success);
        });
    },

    load: function(query, skipNum, limitNum, callback){
        db.collection(this.collection).find(query).skip(skipNum).limit(limitNum).toArray(function(err, items){
            if(err){
                console.info(err);
                return callback(status.fail);
            }
            var obj = {
                status: status.success.status,
                message: status.success.message,
                items: items
            };
            return callback(obj);
        });
    },

    loadSort: function(query,sort, skipNum, limitNum, callback){
        db.collection(this.collection).find(query).sort(sort).skip(skipNum).limit(limitNum).toArray(function(err, items){
            if(err){
                console.info(err);
                return callback(status.fail);
            }
            var obj = {
                status: status.success.status,
                message: status.success.message,
                items: items
            };
            return callback(obj);
        });
    },

    distinct: function(key,query, callback){
        db.collection(this.collection).distinct(key,query,function(err,r){
            if(err){
                console.info(err);
                return callback(status.fail);
            }
            var obj = {
                status: status.success.status,
                message: status.success.message,
                items: r
            };
            return callback(obj);
        });
    },

    count : function(query,callback){
        db.collection(this.collection).count(query,function(err,r){
            if(err){
                console.info(err);
                return callback(status.fail);
            }
            return callback(r);
        });
    },

    gourpCount : function(key,query,callback){
        db.collection(this.collection).aggregate([ { $match: query },{ $group: {
            _id: "$"+key,
            count: { $sum: 1 }
        }},{ $sort: { _id: 1 } }],function(err,r){
            callback(r);
        });
    },

    distinctCount : function(key,query, callback){
        db.collection(this.collection).aggregate([ { $match: query },{$group:{_id:"$"+key}},{
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }],function(err,r){
            callback(r);
        });
    },

    sum : function(key,query,callback){
        db.collection(this.collection).aggregate([ { $match: query },{ $group: {
            _id: null,
            sum: { $sum: "$" + key }
        }}],function(err,r){
            callback(r);
        });
    },

    aggregate : function(arr,callback){
        db.collection(this.collection).aggregate(arr,function(err,r){
            callback(r);
        });
    }
};

module.exports = Handler;