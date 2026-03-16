const WithdrawalRequest = require('../models/WithdrawalRequest');
const User = require('../models/User');
const sequelize = require('../config/db');
const { Op } = require("sequelize");

// User: Submit withdrawal request
const submitWithdrawal = async (req, res) => {
  try {
    const { amount } = req.body; // Removed bankAccountId
    const userId = req.user.userId;

    const user = await User.findOne({ where: { userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has bank details
    if (!user.accountNumber || !user.ifsc) {
      return res.status(400).json({ message: "Please add bank details first" });
    }

    const withdrawAmount = Number(amount);
    
    // Add minimum amount validation
    if (withdrawAmount < 200) {
      return res.status(400).json({ message: "Minimum withdrawal amount is ₹200" });
    }

    if (user.walletBalance < withdrawAmount) { // Changed from ledger_balance to walletBalance
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Removed BankAccount check since we're using User model directly

    const withdrawal = await WithdrawalRequest.create({
      user_id: userId,
      amount: withdrawAmount,
      // Removed bank details from here since they're in User model
      status: "pending"
    });

    res.status(201).json({ 
      message: "Withdrawal request submitted successfully", 
      withdrawal 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get all withdrawals with user details
const getAllWithdrawals = async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = status ? { status } : {};

    const withdrawals = await WithdrawalRequest.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: [
                'id',
                'userId',
                'email',
                'firstName',
                'lastName',
                'bankName',           // ✓ Correct
                'accountNumber',      // ✓ Correct
                'ifsc',               // ✓ Correct
                'upiId'               // ✓ Correct
            ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Admin: Approve withdrawal
const approveWithdrawal = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id, admin_message } = req.body;
        const withdrawal = await WithdrawalRequest.findByPk(id, { transaction: t });

        if (!withdrawal) {
            await t.rollback();
            return res.status(404).json({ message: 'Withdrawal request not found' });
        }

        if (withdrawal.status !== 'pending') {
            await t.rollback();
            return res.status(400).json({ message: 'Withdrawal already processed' });
        }

        const user = await User.findOne({ 
            where: { userId: withdrawal.user_id }, 
            transaction: t 
        });
        const amount = parseFloat(withdrawal.amount);

        if (parseFloat(user.walletBalance) < amount) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient user balance' });
        }

        if (user.disableWithdrawals) {
            await t.rollback();
            return res.status(400).json({ message: 'User withdrawals are disabled' });
        }

        // Deduct from balance
        user.walletBalance = parseFloat(user.walletBalance) - amount;
        user.totalWithdrawn = (parseFloat(user.totalWithdrawn) || 0) + amount;
        await user.save({ transaction: t });

        // Check if this is user's FIRST approved withdrawal
        const previousWithdrawals = await WithdrawalRequest.count({
            where: { 
                user_id: user.userId, 
                status: 'approved',
                id: { [Op.ne]: id } // exclude current withdrawal
            },
            transaction: t
        });

        console.log("previousWithdrawals",previousWithdrawals);
        // If this is FIRST withdrawal AND user was referred
        if (previousWithdrawals === 0 && user.referral) {
            // Extract the userId from the referral URL
            // Example: "http://localhost:5173/register?ref=USER" -> "USER"
            let referrerUserId = null;
            
            if (user.referral.includes('ref=')) {
                // Extract the value after 'ref='
                referrerUserId = user.referral.split('ref=')[1];
            } else {
                // If it's already just the userId
                referrerUserId = user.referral;
            }

            // Find the referrer using the extracted userId
            const referrer = await User.findOne({
                where: { userId: referrerUserId },
                transaction: t
            });

            // console.log("force",referrerUserId,referrer);

            if (referrer) {
                // Add ₹50 to referrer's wallet
                referrer.walletBalance = parseFloat(referrer.walletBalance || 0) + 50;
                await referrer.save({ transaction: t });
                
                // console.log(`✅ ₹50 credited to referrer ${referrer.userId} for user ${user.userId}'s first withdrawal`);
            }
        }

        withdrawal.status = 'approved';
        withdrawal.admin_message = admin_message;
        await withdrawal.save({ transaction: t });

        await t.commit();
        res.json({ 
          message: 'Withdrawal approved successfully',
          withdrawal 
        });
    } catch (error) {
        await t.rollback();
        console.log("error",error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin: Reject withdrawal
const rejectWithdrawal = async (req, res) => {
    try {
        const { id, admin_message } = req.body;
        const withdrawal = await WithdrawalRequest.findByPk(id);

        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal request not found' });
        }

        if (withdrawal.status !== 'pending') {
            return res.status(400).json({ message: 'Withdrawal already processed' });
        }

        withdrawal.status = 'rejected';
        withdrawal.admin_message = admin_message;
        await withdrawal.save();

        res.json({ 
          message: 'Withdrawal rejected',
          withdrawal 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// User: Get their own withdrawal history
const getUserWithdrawalHistory = async (req, res) => {
    try {
        const userId = req.user.userId; // or req.user.id depending on your auth

        const withdrawals = await WithdrawalRequest.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']]
        });

        res.json(withdrawals);
    } catch (error) {
        console.error('Error fetching user withdrawal history:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    submitWithdrawal,
    getAllWithdrawals,
    getUserWithdrawalHistory,
    approveWithdrawal,
    rejectWithdrawal
};