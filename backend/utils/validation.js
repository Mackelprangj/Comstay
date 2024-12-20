const { validationResult } = require('express-validator');
const { check } = require('express-validator');

// middleware for formatting errors from express-validator middleware
const handleValidationErrors = (req, _res, next) => {
    const validationErrors = validationResult(req);
  
    if (!validationErrors.isEmpty()) { 
      const errors = {};
      validationErrors
        .array()
        .forEach(error => errors[error.path] = error.msg);
  
      const err = Error("Bad Request");
      err.errors = errors;
      err.status = 400;
      err.title = "Bad Request";
      next(err);
    }
    next();
  };
  
  const validateReview = [
    check('review').exists({ checkFalsy: true }).withMessage(`Review text is required.`),
    check('stars').exists({ checkFalsy: true }).withMessage(`Review couldn't be found.`).isInt({ gt: 0, lt: 6 }).withMessage(`Stars must be an integer from 1 to 5.`),
    handleValidationErrors
];

const validateQueryValues = [
  check('page').optional().isInt({ min: 1 }).withMessage('Page must be greater than or equal to 1'),
  check('size').optional().isInt({ min: 1 }).withMessage('Size must be greater or equal to 1'),
  check('maxLat').optional().isFloat({ max: 90 }).withMessage('Maximum latitude is invalid'),
  check('minLat').optional().isFloat({ min: -90 }).withMessage('Minimum latitude is invalid'),
  check('maxLng').optional().isFloat({ max: 180 }).withMessage('Maximum longitude is invalid'),
  check('minLng').optional().isFloat({ min: -180 }).withMessage('Minimum longitude is invalid'),
  check('minPrice').optional().isDecimal({ min: 0 }).withMessage('Minimum price must be greater than or equal to 0'),
  check('maxPrice').optional().isDecimal({ min: 0 }).withMessage('Maximum price must be greater than or equal to 0'),
  check('minPrice').optional().isDecimal({ max: 'maxPrice' }).withMessage('Minimum price must be lower than Maximum.'),
  check('maxPrice').optional().isDecimal({ min: 'minPrice' }).withMessage('Maximum price must be greater than Minimum.'),
  handleValidationErrors
];

const reviewCreationValidation = async (req, res, next) => {
  const { id } = req.user;
  const { reviewId } = req.params;
  try {
      const review = await Review.findByPk(reviewId);

      if (!review) {
          return res.status(404).json({
              message: "Review couldn't be found"
          })
      }

      if (review.userId !== id) {
          const err = new Error('Unauthorized');
          err.status = 403;
          err.title = 'Forbidden';
          return next(err);
      }

      next();
  } catch (error) {
      next(error)
  }
};

const validateSpot = [
  check('address').exists({ checkFalsy: true }).notEmpty().withMessage('Street address is required'),
  check('city').exists({ checkFalsy: true }).notEmpty().withMessage('City is required'),
  check('state').exists({ checkFalsy: true }).notEmpty().withMessage('State is required'),
  check('country').exists({ checkFalsy: true }).notEmpty().withMessage('Country is required'),
  check('lat').exists({ checkFalsy: true }).notEmpty().withMessage('Latitude is required'),
  check('lat').isFloat({min:-90, max: 90}).withMessage('Latitude is not valid'),
  check('lng').exists({ checkFalsy: true }).notEmpty().withMessage('Longitude is required'),
  check('lng').isFloat({min:-180, max: 180}).withMessage('Longitude is not valid'),
  check('name').isLength({max: 50}).withMessage('Name must be less than 50 characters'),
  check('description').exists({ checkFalsy: true }).notEmpty().withMessage('Description is required'),
  check('price').exists({checkFalsy: true}).notEmpty().withMessage('"Price per day is required"'),
  handleValidationErrors
];
  
  module.exports = {
    validateReview,
    validateQueryValues,
    reviewCreationValidation,
    validateSpot,
    handleValidationErrors
  };