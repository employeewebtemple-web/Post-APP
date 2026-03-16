const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const PostWatch = require('../models/PostWatch');
const Support = require("../models/Support");
const e = require('express');

// Define associations here
PostWatch.belongsTo(Post, { foreignKey: 'postId' });
Post.hasMany(PostWatch, { foreignKey: 'postId' });

const generateUserId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digit random number
    return `APP-${randomNum}`;
};

exports.register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, city, state, referral } = req.body;

        // Mandatory fields check
        if (!firstName || !lastName || !phone || !email || !password || !city || !state || !referral) {
            return res.status(400).json({ message: 'All fields are mandatory' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'Email already in use' });

        // Generate unique User ID
        let userId = generateUserId();
        let userExists = await User.findOne({ where: { userId } });
        while (userExists) {
            userId = generateUserId();
            userExists = await User.findOne({ where: { userId } });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            userId,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            city,
            state,
            referral,
            walletBalance: 0,
            totalWithdrawn: 0
        });

        // Generate JWT
        const token = jwt.sign(
            { id: newUser.id, userId: newUser.userId, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            userId: newUser.userId,
            token,
            user: {
                userId: newUser.userId,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                phone: newUser.phone,
                city: newUser.city,
                state: newUser.state,
                referral: newUser.referral,
                walletBalance: newUser.walletBalance,
                totalWithdrawn: newUser.totalWithdrawn
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.upsertBankDetails = async (req, res) => {
    try {
        const { accountNumber, ifsc, bankName, upiId } = req.body;
        const userId = req.user.userId;

        if (!accountNumber || !ifsc || !bankName || !upiId) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validation
        if (!/^[0-9]{9,18}$/.test(accountNumber)) return res.status(400).json({ message: 'Invalid account number' });
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())) return res.status(400).json({ message: 'Invalid IFSC code' });
        if (!/^[\w.-]+@[\w.-]+$/.test(upiId)) return res.status(400).json({ message: 'Invalid UPI ID' });

        const existing = await User.findOne({ where: { userId } });

        if (existing) {
            await User.update(
                { accountNumber, ifsc: ifsc.toUpperCase(), bankName, upiId },
                { where: { userId } }
            );
            res.json({ message: 'Bank details updated successfully' });
        } else {
            await User.create({
                userId,
                accountNumber,
                ifsc: ifsc.toUpperCase(),
                bankName,
                upiId
            });
            res.json({ message: 'Bank details created successfully' });
        }

    } catch (error) {
        console.error('Bank Details Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getBankDetails = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findOne({ where: { userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ bank: user });
    } catch (error) {
        console.error('Get Bank Details Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier can be email or userId

        // Find user by email or userId
        const user = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { email: identifier },
                    { userId: identifier }
                ]
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                message: "Your account has been blocked. Contact support."
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, userId: user.userId, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                userId: user.userId,
                email: user.email,
                disableIncome: user.disableIncome,
                disableWithdrawals: user.disableWithdrawals,
                walletBalance: user.walletBalance,
                totalWithdrawn: user.totalWithdrawn
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProfile = async (req, res) => {
  try {

    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id",
        "userId",
        "email",
        "walletBalance",
        "disableIncome",
        "disableWithdrawals",
        "totalWithdrawn",
        "createdAt"
      ]
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};


exports.getPosts = async (req, res) => {
  try {
    const userId = req.user.userId;

    const posts = await Post.findAll();

    // Add 'rewarded' flag per post for this user
    const postsWithReward = await Promise.all(
      posts.map(async (post) => {
        const watch = await PostWatch.findOne({ where: { userId, postId: post.id } });
        return {
          ...post.dataValues,
          rewarded: watch ? watch.rewarded : false,
        };
      })
    );

    res.json(postsWithReward);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.claimReward = async (req, res) => {
  try {
    const { postId, watchedTime } = req.body; // Get watchedTime from request
    const userId = req.user.userId;

    const post = await Post.findByPk(postId);

    let watch = await PostWatch.findOne({ where: { userId, postId } });

    if (!watch) {
      // Create new watch entry with the provided watchedTime
      watch = await PostWatch.create({ 
        userId, 
        postId, 
        rewarded: false, 
        watchedTime: watchedTime || "00:00" // Use provided watchedTime
      });
    }

    // Check if already rewarded
    if (watch.rewarded) {
      return res.status(400).json({ message: "Reward already claimed" });
    }

    const isVideo = !!post.watchTime && post.watchTime !== "00:00";

    if (isVideo) {
      // Use the watchedTime from request (frontend) for validation
      // This is the actual time user has watched
      const watchedTimeStr = watchedTime || watch.watchedTime || "00:00";

      const [min, sec] = (post.watchTime || "00:00").split(":").map(Number);
      const requiredTime = min * 60 + sec;

      const [watchedMin, watchedSec] = watchedTimeStr.split(":").map(Number);
      const watchedSeconds = watchedMin * 60 + watchedSec;

    //   console.log("Required time:", requiredTime, "Watched time:", watchedSeconds);

      if (watchedSeconds < requiredTime) {
        return res.status(400).json({ message: "Watch full time to claim reward" });
      }

      // Update the watched time in database only after successful validation
      watch.watchedTime = watchedTimeStr;
    }

    // Mark as rewarded
    watch.rewarded = true;
    await watch.save();

    post.totalUsersWatched += 1;
    await post.save();

    res.json({ message: "Reward claimed successfully", reward: post.price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateWallet = async (req, res) => {
  try {
    const userId = req.user.userId; // this is the string identifier
    const { walletBalance, totalWithdrawn } = req.body;

    // Find the user by userId (string) instead of primary key
    const user = await User.findOne({ where: { userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update wallet fields if provided
    if (walletBalance !== undefined) user.walletBalance = walletBalance;
    if (totalWithdrawn !== undefined) user.totalWithdrawn = totalWithdrawn;

    await user.save(); // persist changes

    res.status(200).json({
      message: "Wallet updated successfully",
      walletBalance: user.walletBalance,
      totalWithdrawn: user.totalWithdrawn,
    });
  } catch (error) {
    console.error("Error updating wallet:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add this new endpoint to your controller
exports.updateWatchProgress = async (req, res) => {
  try {
    const { postId, watchedTime } = req.body;
    const userId = req.user.userId;

    let watch = await PostWatch.findOne({ where: { userId, postId } });

    if (!watch) {
      // Create new watch entry
      watch = await PostWatch.create({ 
        userId, 
        postId, 
        rewarded: false, 
        watchedTime: watchedTime || "00:00"
      });
    } else {
      // Only update if not rewarded
      if (!watch.rewarded) {
        // Parse current and new watched times to compare
        const [currentMin, currentSec] = (watch.watchedTime || "00:00").split(":").map(Number);
        const currentTotal = currentMin * 60 + currentSec;
        
        const [newMin, newSec] = (watchedTime || "00:00").split(":").map(Number);
        const newTotal = newMin * 60 + newSec;
        
        // Only update if new time is greater (prevent overwriting with smaller time)
        if (newTotal > currentTotal) {
          watch.watchedTime = watchedTime;
          await watch.save();
          console.log(`Updated watch progress for user ${userId}, post ${postId}: ${watchedTime}`);
        }
      }
    }

    res.json({ 
      message: "Watch progress updated", 
      watchedTime: watch.watchedTime 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Add this endpoint to get watch progress
exports.getWatchProgress = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const watch = await PostWatch.findOne({ 
      where: { userId, postId } 
    });

    res.json({ 
      watchedTime: watch?.watchedTime || "00:00",
      rewarded: watch?.rewarded || false 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.createSupport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subject, message } = req.body;

    // create ticket first
    const ticket = await Support.create({
      userId,
      subject,
      message,
      sender: "user"
    });

    // update ticketId = its own id
    await ticket.update({
      ticketId: ticket.id
    });

    res.json(ticket);

  } catch (error) {
    console.error("Support create error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserSupportMessages = async (req, res) => {
  try {
    const userId = req.user.userId;

    const messages = await Support.findAll({
      where: { userId },
      order: [["createdAt", "ASC"]]
    });

    res.json(messages);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

exports.getUserReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    
    // Get start of today
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    
    // Get start of week (Sunday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    // Get start of month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all user's rewarded posts with post details
    const watches = await PostWatch.findAll({
      where: { 
        userId,
        rewarded: true // Only count rewarded posts
      },
      include: [{
        model: Post,
        attributes: ['title', 'price']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Calculate earnings by period
    let todayEarnings = 0;
    let weeklyEarnings = 0;
    let monthlyEarnings = 0;
    let totalEarnings = 0;

    watches.forEach(watch => {
      const watchDate = new Date(watch.createdAt);
      const amount = watch.Post?.price || 0;
      
      totalEarnings += amount;
      
      if (watchDate >= todayStart) {
        todayEarnings += amount;
      }
      if (watchDate >= weekStart) {
        weeklyEarnings += amount;
      }
      if (watchDate >= monthStart) {
        monthlyEarnings += amount;
      }
    });

    // Get recent earnings (last 10)
    const recentEarnings = watches.slice(0, 10).map(watch => ({
      date: watch.createdAt.toLocaleDateString(),
      postTitle: watch.Post?.title || 'Unknown Post',
      amount: watch.Post?.price || 0,
      status: 'Claimed'
    }));

    // Calculate completion rate (rewarded vs total attempts)
    const totalAttempts = await PostWatch.count({
      where: { userId }
    });
    
    const rewardedCount = watches.length;
    const completionRate = totalAttempts > 0 
      ? Math.round((rewardedCount / totalAttempts) * 100) 
      : 0;

    res.json({
      todayEarnings,
      weeklyEarnings,
      monthlyEarnings,
      totalEarnings,
      postsWatched: rewardedCount,
      completionRate,
      recentEarnings
    });

  } catch (error) {
    console.error("Report error:", error);
    res.status(500).json({ message: "Server error" });
  }
};