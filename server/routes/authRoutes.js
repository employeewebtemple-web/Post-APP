const express = require('express');
const router = express.Router();
const { verifyUserJWT } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const { submitWithdrawal, getUserWithdrawalHistory } = require('../controllers/withdrawalController');

// User Auth
router.post('/register', authController.register); // Public registration enabled
router.post('/login', authController.login);

// user profile data
router.get('/profile', verifyUserJWT, authController.getProfile);

// bank details
router.post('/upsertBankDetails', verifyUserJWT, authController.upsertBankDetails);
router.get('/bankDetails', verifyUserJWT, authController.getBankDetails);

// posts routes
router.get('/posts', verifyUserJWT,authController.getPosts);
router.post("/claim-reward", verifyUserJWT, authController.claimReward);

router.post("/update-watch-progress", verifyUserJWT, authController.updateWatchProgress);
router.get("/watch-progress/:postId", verifyUserJWT, authController.getWatchProgress);

// wallet routes
router.put('/updateWallet', verifyUserJWT, authController.updateWallet);

// support
router.post("/support", verifyUserJWT, authController.createSupport);
router.get("/support/messages", verifyUserJWT, authController.getUserSupportMessages);

// withdraw
router.post('/withdraw', verifyUserJWT, submitWithdrawal);
router.get('/withdrawal-history', verifyUserJWT, getUserWithdrawalHistory);

// user-report route
router.get('/report', verifyUserJWT, authController.getUserReport);

module.exports = router; 
