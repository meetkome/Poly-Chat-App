const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const sharp = require('sharp');
const User = require("../models/userModel");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'images/');
//   },
//   filename: (req, file, cb) => {
//     const photoName = crypto.randomBytes(20).toString('hex');
//     console.log(photoName);
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${photoName}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  const photoName = crypto.randomBytes(20).toString('hex');
  req.file.filename = `user-${photoName}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')  
    .jpeg({ quality: 90 })
    .toFile(`images/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
}

exports.updateMe = catchAsync(async(req, res, next) => {
  // 1. Check if you want to update a password and return error
  if(req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password update. Please use /updateMyPassword.', 400))
  }
  
  // 2. Filtered out the unwanted fields names that are not allowed to be uploaded
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3. Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  })
})

// Users function handler
exports.getAllUsers = catchAsync(async(req, res) => {
  
  const users = await User.find();

  // Send Response
  res
  .status(200)
  .json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users
    }
  });
});

exports.getUsers = catchAsync(async(req, res, next) => {
 let currentUser = req.user._id;
 let query = "" + req.query.equalTo;
 const users = await User.find( { _id: { $ne: currentUser } });
 if (!users) {
  return next(new AppError(`No users are available to chat`, 204));
 }
  // Send Response
  res
  .status(200)
  .json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users
    }
  });
});


exports.createUser = (req, res) => {
  res
    .status(500)
    .json({
      status: 'Internal Error',
      message: 'Page is not found'
    })
}
exports.getSingleUser = catchAsync(async(req, res, next) => {

  const user = await User.findById(req.params.id);
  if(!user) {
    return next(new AppError(`No User found`, 404));
  }

  // Send Response
  res
  .status(200)
  .json({
    status: 'success',
    requestedAt: req.requestTime,
    results: user.length,
    data: {
      user
    }
  });
});

exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({
      status: 'Internal Error',
      message: 'Page is not found'
    })
}
exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({
      status: 'Internal Error',
      message: 'Page is not found'
    })
}
