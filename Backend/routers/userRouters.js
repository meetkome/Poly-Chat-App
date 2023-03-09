const express = require('express');
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authControllers');


const router = express.Router();

router.post('/signup', userController.uploadUserPhoto, userController.resizeUserPhoto, authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.protect, authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updateMyPassword', authController.protect, authController.updatePassword);

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.route('/').get(userController.getAllUsers).post(userController.createUser); 
router.route('/:id').get(userController.getSingleUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;