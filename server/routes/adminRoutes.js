const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdminJWT } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');


// Auth
router.post('/login', adminController.login);

// Create User (Admin only)
// router.post('/create-user', verifyAdminJWT, adminController.createUser);

// edit user details
router.post('/users/:userId', verifyAdminJWT, adminController.updateUser);

// Get all users
router.get('/users',verifyAdminJWT, adminController.getAllUsers);

// Get user by ID
router.get('/users/:userId', verifyAdminJWT, adminController.getUserById);

// Unblock / block user
router.put('/users/:userId', verifyAdminJWT, adminController.setUserBlockedStatus );

// reset password
router.post('/users/:userId/reset-password', verifyAdminJWT, adminController.resetUserPassword);

// post routes
router.post("/create-post", verifyAdminJWT,upload.single("media"), adminController.createPost);
router.get("/posts", verifyAdminJWT, adminController.getAllPosts);
router.get('/posts/:id', verifyAdminJWT, adminController.getPostById); 
router.delete('/posts/:id', verifyAdminJWT, adminController.deletePost);

// support routes
router.get("/supports", verifyAdminJWT, adminController.getAllSupports);
router.post("/support/reply", verifyAdminJWT, adminController.replyToSupport);


// Withdrawals (Admin)
const { getAllWithdrawals, approveWithdrawal, rejectWithdrawal } = require('../controllers/withdrawalController');
router.get('/withdrawals', verifyAdminJWT,getAllWithdrawals);
router.post('/withdrawal/approve', verifyAdminJWT,approveWithdrawal);
router.post('/withdrawal/reject', verifyAdminJWT, rejectWithdrawal);

module.exports = router; 

