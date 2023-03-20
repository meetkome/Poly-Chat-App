const express = require('express');
const morgan = require('morgan');
// const tourRouter = require('../starter/routers/tourRouters');
const userRouter = require('./Backend/routers/userRouters');
const app = express();
const AppError = require('./Backend/utils/appError');
const globalErrorHandler = require('./Backend/controllers/errorControllers');
const cookieParser = require('cookie-parser');

// Middleware
// Third Party Middleware
console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
  
}
app.use(express.json());

app.use(express.static(`${__dirname}`));
app.use(express.static(`${__dirname}/images`));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
})

app.use('/api/v1/users', userRouter);


app.all('*', (req, res, next) => {

  next(new AppError(`Can not found ${req.originalUrl} on this server`, 404));
})

app.use(globalErrorHandler);


module.exports = app;
