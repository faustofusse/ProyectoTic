var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
var url = "mongodb+srv://fausto-fusse:1234@tarscluster-djpnf.gcp.mongodb.net/tars";
//var url = "mongodb://localhost:27017/tars";

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

var app = express();

// database connection
mongoose.connect(url, {useNewUrlParser:true});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// middlewares
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// express session
app.use(session({secret:'secret',saveUninitialized:true,resave:true}));

// passport
app.use(passport.initialize());
app.use(passport.session());

// express validator
app.use(expressValidator({
  errorFormatter:function(param, msg, value){
    var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;
    while (namespace.length){
      formParam += '[' + namespace.shift() + ']';
    }
    return {param: formParam, msg: msg, value: value};
  }
}));

// flash
app.use(flash());
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// routing
app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;