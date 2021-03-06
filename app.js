var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var chienDichRouter = require('./routes/chienDich');
var ungVienRouter = require('./routes/ungVien');
var chiPhiRouter = require('./routes/ChiPhi');
var giaiDoanRouter = require('./routes/giaiDoan');
var yeuCauRouter = require('./routes/YeuCau');
var viTriRouter = require('./routes/viTri');
var groupRouter = require('./routes/Group');

var app = express();

app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/chiendich', chienDichRouter);
app.use('/ungvien', ungVienRouter);
app.use('/chiphi', chiPhiRouter);
app.use('/giaidoan', giaiDoanRouter);
app.use('/yeucau', yeuCauRouter);
app.use('/vitri', viTriRouter);
app.use('/group', groupRouter);
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
