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

/* ---
QUERY DATABASE
- Delete: db.getCollection('tours').find({"name": {$regex: "Bui.*"}}).sort({_id: -1}).count()
*/


console.log('hihi')