const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

// CONNECT MONGODB
mongoose.set('strictQuery', false);
mongoose
  .connect('mongodb://localhost:27017/natours', {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('Connection successful !!');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// Database  connect errors
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! - Shutting down');
  server.close(() => {
    process.exit(1);
  });
});

// example error: To log something that doesn't exist
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION - Shutting down');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
