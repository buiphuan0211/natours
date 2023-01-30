const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');

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

// READ FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8')
);

// IMPORT DATA INTO MONGODB
const importData = async (req, res) => {
  try {
    await Tour.create(tours);
    console.log('Import data successfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FORM COLLECTION
const deleteData = async (req, res) => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// RUN
console.log(process.argv);

if (process.argv[2] == '--import') {
  importData();
} else if (process.argv[2] == '--delete') {
  deleteData();
}
