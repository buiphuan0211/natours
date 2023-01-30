const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tours must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour must have less and equal then 40 characters'],
      minLength: [5, 'A tour must have more and equal then 5 characters'],
      // validate: [validator.isAlpha, 'Tour name must be contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tours mus have a durations'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tours mus have a maxGroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tours mus have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficulty'],
        message: ['Difficulty is either: easy, medium, difficulty'],
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be above 1'],
      max: [5, 'rating must be below 5'],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a imageCover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // not select fields response
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add file virtual response (filed does not exist in database)
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: run before save doc
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post('save', function (doc, next) {
//   next();
// });

// QUERY MIDDLEWARE ------
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // Same function as above
  // if want to see docs when find
  // console.log(docs);
  next();
});

// MIDDLEWARE AGGREGATION ------
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: {
      secretTour: { $ne: true },
    },
  });
  // console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
