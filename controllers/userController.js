const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllUser = catchAsync(async (req, res) => {
  const users = await User.find();
  return res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.createUser = (req, res) => {
  return res.status(500).json({
    status: 'error',
    message: 'This route is ot yet defined'
  });
};

exports.updateUser = (req, res) => {
  return res.status(500).json({
    status: 'error',
    message: 'This route is ot yet defined'
  });
};

exports.deleteUser = (req, res) => {
  return res.status(500).json({
    status: 'error',
    message: 'This route is ot yet defined'
  });
};
