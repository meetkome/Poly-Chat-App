const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  }
  if(process.env.NODE_ENV === 'production') cookieOption.secure = true;
  
  res.cookie('jwt', token, cookieOption)
  
  //Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
}

const signToken = id => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

exports.signup = catchAsync(async(req, res, next) => {
  // console.log(req.file);
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    photo: req.file.filename,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    passwordResetToken: req.body.passwordResetToken,
    passwordResetExpires: req.body.passwordResetExpires
  });

  createSendToken(newUser, 201, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    statuss: "Offline now"
  })
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 60 * 1000),
    httpOnly:true
  }); 

  res.status(200).json({
    status: 'success'
  })
})

exports.login = catchAsync(async(req, res, next) => {
  const { email, password } = req.body;
  const statuss = {statuss: 'Active now'};

  // 1. Check if the email and password is not empty
  if(!email || !password) {
    return next(new AppError('Please provide email and password!', 400))
  } 

  // 2. Check if user exists && password is correct 
  const user = await User.findOne({ email}).select('+password');
  if(!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password', 401));
  }
  await user.updateOne(statuss, {statuss: 'Active now'});

  createSendToken(user, 200, res);
});    

exports.protect = catchAsync(async(req, res, next) => {
  let token;

  // 1. Getting token and check if it is there
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
   token = req.headers.authorization.split(' ')[1]; 
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if(!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401))
  }

  // 2. Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded); 

  // 3. Check if user still exits
  const currentUser = await User.findById(decoded.id);
  if(!currentUser) {
    return next(new AppError('The token does not longer exist', 401));
  }

  // 4. Check if user change password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User Recently changed password! Please log in again', 401));
  }; 

  // Grant access to protected route
  req.user = currentUser;
  next();
})

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)){
      return next(new AppError('You do not have permission to perform this action', 403))
    }
    next();
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get the user identity based on the email
  const user = await User.findOne({ email: req.body.email });
  if(!user) {
    return next(new AppError('There is no user with email address.', 404))
  }

  // Generate a random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false})
  

  // send it to the user's email address
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with the new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, Please ignore this email!`;
  
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    })
  
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false})
    console.log(err);

    return next(new AppError('There was an error sending the email. Try again later'), 500)
  }
});

exports.resetPassword = catchAsync(async(req, res, next) => {
  //  1. Get user based on token
  const hashedToken = crypto
  .createHash('sha256')
  .update(req.params.token)
  .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  
  // 2 if token has expired, and there is user is not valid, set new password
  if(!user) {
    return next(new AppError('Token is invalid or has expired', 400))
  }

  //2B if token is available set the new password
  // console.log(user);
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordChangedAt = req.body.passwordChangedAt;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3 Update changedPasswordAt property for the user

  // 4 Log the user in, send the token to the client
  createSendToken(user, 200, res);

});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2 check if the current password is correct
  if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('The current password is incorrect, input the current password', 401));
  }

  // 3 if so, update the new password
  user.password = req.body.password; 
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();
  // Using findByUpdate will not work as intended

  // 4 Log user in, sending the token 
  createSendToken(user, 200, res);
});

