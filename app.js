var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const favicon = require('express-favicon')
let hbs = require('hbs')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const dataRouter = require('./routes/data');


var app = express();

// view engine setup
hbs.registerHelper('dd_mm_yyyy', function (value, options) {
  let date = new Date(`${value}`)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
})
hbs.registerPartials(__dirname + '/views/partials');

app.set('view engine', 'hbs');
/* app.set('views', path.join(__dirname, 'views')); */

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(favicon(__dirname + '/public/favicon.png'));
app.use(express.static(path.join(__dirname, 'public')));

//import any npm package to handlebars by this way
app.use('/static/editor.js', express.static('./node_modules/@editorjs/editorjs/dist/editor.js'))
app.use('/static/header.js', express.static('./node_modules/@editorjs/header/dist/bundle.js'))
app.use('/static/list.js', express.static('./node_modules/@editorjs/list/dist/bundle.js'))
app.use('/static/embed.js', express.static('./node_modules/@editorjs/embed/dist/bundle.js'))
app.use('/static/image.js', express.static('./node_modules/@editorjs/image/dist/bundle.js'))


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/data', dataRouter);

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
