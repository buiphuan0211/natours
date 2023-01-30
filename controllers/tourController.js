const Tour = require('../models/tourModel');
const APIFeature = require('../utils/apiFeature');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//
// API MAIN
//

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  return res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.getAllTours = catchAsync(async (req, res) => {
  // Execute query
  const features = new APIFeature(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  return res.status(200).json({
    success: true,
    length: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findById(req.params.id);
  // const tour = await Tour.findOne({ _id: req.params.id });

  return res.status(200).json({
    success: 'success',
    data: {
      tour
    }
  });
});

exports.updateTour = async (req, res) => {
  try {
    const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true // Active validation mongoose when update
    });
    return res.status(200).json({
      success: true,
      data: {
        tour: newTour,
        runValidator: true
      }
    });
  } catch (error) {
    return res.status(404).json({
      success: 'fail',
      message: error.message
    });
  }
};

exports.deleteTour = catchAsync(async (req, res, next) => {
  console.log(typeof req.params.id)
  const tour = await Tour.findOneAndDelete({_id: req.params.id});

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
exports.aliasTopTour = catchAsync(async (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'ratingsAverage,price';
  req.query.sort = 'name,price,ratingsAverage,summary,difficulty';
  next();
});

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, // _id: null
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsAverage' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxRating: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  return res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: {
          $push: '$name'
        }
      }
    },
    {
      $addFields: { month: '$_id' } // To replace filed _id
    },
    {
      $project: {
        _id: 0 // hide filed _id
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
    // {
    //   $project: { _id: 1, name: 1, startDates: 1 }, // Select fields -> check data
    // },
  ]);

  return res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});

//
// API HELPER
//

exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);
  if (req.params.id.length == 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'Tour not found'
    });
  }

  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }

  next();
};
