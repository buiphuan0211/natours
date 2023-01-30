const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('tiny'));
app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ROUTE
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Couldn't find ${req.originalUrl} on this server !`, 404));
});

app.use(globalErrorHandler);

// START SERVER
module.exports = app;
