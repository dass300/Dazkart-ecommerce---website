var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var db=require('./config/connection')
var session=require('express-session')


var adminRouter = require('./routes/admin');
var userRouter = require('./routes/user');


var hbs=require('express-handlebars')
var app = express();
var handlebar=hbs.create({});

handlebar.handlebars.registerHelper('if_eq', function(a, b, opts) {
  if(a == b) // Or === depending on your needs
      return opts.fn(this);
  else
      return opts.inverse(this);
});
// var fileUpload =require('express-fileupload')

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials', helpers: {
  inc: function (value, options) {
    return parseInt(value) + 1;
  }
}}))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(fileUpload())
app.use(session({secret:'key',
cookie:{maxAge:600000},
resave:false,
saveUninitialized:false
}))
db.connect((err)=>{
  if(err)
  console.log('Connection Error'+err);
  else
  console.log("Database Connected to port 27017");
})

app.use('/admin',adminRouter);
app.use('/', userRouter);

// catch 404 and forward to error handlerrs
app.use(function(req, res, next) {
 next(createError(404));
  // next(createError('user/404'));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development'? err : {};

  // render the error page
  res.status(err.status || 500);
 res.render('error');
  // res.render('user/404');
});

module.exports = app;
