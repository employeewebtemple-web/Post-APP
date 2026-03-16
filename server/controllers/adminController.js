const AdminUser = require('../models/AdminUser');
const User = require('../models/User');
const Post = require("../models/Post");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Support = require('../models/Support');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await AdminUser.findOne({ where: { email } });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, role: admin.role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1d' }
        );

        res.json({ token, role: admin.role });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.createUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            city,
            state,
            referral,
            password
        } = req.body;

        // Check mandatory fields
        if (!firstName || !lastName || !email || !phone || !city || !state || !referral || !password) {
            return res.status(400).json({ message: 'All fields are mandatory' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate unique userId
        let userId = 'APP-' + Math.floor(100000 + Math.random() * 900000);
        let userExists = await User.findOne({ where: { userId } });
        while (userExists) {
            userId = 'APP-' + Math.floor(100000 + Math.random() * 900000);
            userExists = await User.findOne({ where: { userId } });
        }

        // Create user
        const newUser = await User.create({
            userId,
            firstName,
            lastName,
            email,
            phone,
            city,
            state,
            referral,
            password: hashedPassword,
            accountNumber: '', // leave empty for now
            ifsc: '',
            bankName: '',
            upiId: '',
            walletBalance: 0,
            totalWithdrawn: 0
        });

        res.status(201).json({
            message: 'User created successfully',
            userId: newUser.userId
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: [
                'id',
                'userId',
                'firstName',
                'lastName',
                'email',
                'phone',
                'city',
                'state',
                'referral',
                'walletBalance',
                'totalWithdrawn',
                'accountNumber',
                'ifsc',
                'bankName',
                'upiId',
                'isBlocked'
            ]
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findOne({
            where: { userId },
            attributes: [
                'id',
                'userId',
                'firstName',
                'lastName',
                'email',
                'phone',
                'city',
                'state',
                'referral',
                'walletBalance',
                'totalWithdrawn',
                'accountNumber',
                'ifsc',
                'bankName',
                'upiId',
                'isBlocked',
                'disableIncome',
                'disableWithdrawals'
            ]
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            firstName,
            lastName,
            email,
            phone,
            city,
            state,
            referral,
            walletBalance,
            totalWithdrawn,
            accountNumber,
            ifsc,
            bankName,
            upiId,
            disableIncome,
            disableWithdrawals,
            isBlocked
        } = req.body;

        const user = await User.findOne({ where: { userId } });
        if (!user) return res.status(404).json({ message: "User not found" });

        await user.update({
            firstName,
            lastName,
            email,
            phone,
            city,
            state,
            referral,
            walletBalance,
            totalWithdrawn,
            accountNumber,
            ifsc,
            bankName,
            upiId,
            disableIncome,
            disableWithdrawals,
            isBlocked
        });

        res.json({
            success: true,
            message: "User updated successfully",
            user
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.setUserBlockedStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body; // true → block, false → unblock

    const user = await User.findOne({ where: { userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({ isBlocked }); // update the status

    res.json({
      success: true,
      message: isBlocked ? "User blocked successfully" : "User unblocked successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetUserPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required"
            });
        }

        const user = await User.findOne({ where: { userId } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await user.update({ password: hashedPassword });

        res.json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error("Error resetting user password:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.createPost = async (req, res) => {
  try {
    const { title, link, price, minutes, seconds, watchTime } = req.body;
    const media = req.file ? `uploads/${req.file.filename}` : null;

    // Convert minutes + seconds to MM:SS if provided separately
    let finalWatchTime = watchTime;
    if ((minutes !== undefined || seconds !== undefined) && (minutes !== "" || seconds !== "")) {
      const min = Number(minutes) || 0;
      const sec = Number(seconds) || 0;
      finalWatchTime = `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    }

    // Validation
    if (!title || (!media && !link) || !price || (link && !finalWatchTime)) {
      return res.status(400).json({
        message: "All fields required and either media or link must exist, watch time required for video posts",
      });
    }

    const post = await Post.create({
      title,
      media,
      link,
      price,
      watchTime: finalWatchTime,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("createPost error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.json(posts);
  } catch (err) {
    console.error("getAllPosts error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findByPk(id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Optional: Delete associated media file from server
    // if (post.media) {
    //   fs.unlinkSync(post.media);
    // }
    
    await post.destroy();
    
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllSupports = async (req, res) => {
  const tickets = await Support.findAll({
    order: [["createdAt", "DESC"]]
  });

  res.json(tickets);
};

exports.replyToSupport = async (req, res) => {
  try {
    //    console.log("BODY:", req.body); 
    const { userId, subject, message, ticketId } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        message: "UserId and message are required"
      });
    }

    const reply = await Support.create({
      userId,
      subject: subject || "Admin Reply",
      ticketId,
      message,
      sender: "admin"
    });

    res.status(200).json({
      message: "Reply sent successfully",
      reply
    });

  } catch (error) {
    console.error("Reply error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
