var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');

var routes = require('./routes/index');
var users = require('./routes/users');
var tests = require('./routes/tests');
var timer = require('./routes/timer');
var admin = require('./routes/actions/admin');
var monsterAction = require('./routes/actions/monsterAction');
var mainichiSignAction = require('./routes/actions/mainichiSignAction');
var worldbossAction = require('./routes/actions/worldbossAction');
var ectypeAction = require('./routes/actions/ectypeAction');
var confAction = require('./routes/actions/confAction');
var statisticAction = require('./routes/actions/statisticAction');
var lumiAction = require('./routes/actions/lumiAction');
var mailAction = require('./routes/actions/mailAction');
var versAction = require('./routes/actions/versAction');
var broadcastAction = require('./routes/actions/broadcastAction');
var playerAction = require('./routes/actions/playerAction');
var orderAction = require('./routes/actions/orderAction');
var useOutAction = require('./routes/actions/useOutAction');
var propsKeyAction = require('./routes/actions/propsKeyAction');
var noticeAction = require('./routes/actions/noticeAction');
var svrMgrAction = require('./routes/actions/svrMgrAction');
var hkAction = require('./routes/actions/hkAction');
var asdkAction = require('./routes/actions/asdkAction');
var uploadAction = require('./uploadAction');
var esdkAction = require('./routes/actions/esdkAction');
var smsdkAction = require('./routes/actions/smsdkAction');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/tests',tests);
app.use('/timer',timer);
app.use('/admin',admin);
app.use('/monsterAction',monsterAction);
app.use('/mainichiSignAction',mainichiSignAction);
app.use('/worldbossAction',worldbossAction);
app.use('/ectypeAction',ectypeAction);
app.use('/confAction',confAction);
app.use('/statisticAction',statisticAction);
app.use('/lumiAction',lumiAction);
app.use('/mailAction',mailAction);
app.use('/versAction',versAction);
app.use('/broadcastAction',broadcastAction);
app.use('/playerAction',playerAction);
app.use('/orderAction',orderAction);
app.use('/useOutAction',useOutAction);
app.use('/propsKeyAction',propsKeyAction);
app.use('/noticeAction',noticeAction);
app.use('/svrMgrAction',svrMgrAction);
app.use('/hkAction',hkAction);
app.use('/asdkAction',asdkAction);
app.use('/uploadAction',uploadAction);
app.use('/esdkAction',esdkAction);
app.use('/smsdkAction',smsdkAction);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
