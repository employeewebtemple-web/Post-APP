const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const User = require('../models/User');

const verifyUserJWT = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        const user = await User.findByPk(decoded.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

const verifyAdminJWT = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        const admin = await AdminUser.findByPk(decoded.id);

        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

// const requireSuperAdmin = (req, res, next) => {
//     if (req.admin && req.admin.role === 'superadmin') {
//         next();
//     } else {
//         res.status(403).json({ message: 'Superadmin access required' });
//     }
// };

module.exports = { verifyUserJWT, verifyAdminJWT };
