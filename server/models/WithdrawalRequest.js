const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const WithdrawalRequest = sequelize.define('WithdrawalRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: User,
            key: 'userId'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    admin_message: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'withdrawal_requests',
    timestamps: true
});

WithdrawalRequest.belongsTo(User, { 
    foreignKey: 'user_id',
    targetKey: 'userId'  // This tells Sequelize that user_id references User.userId
});

User.hasMany(WithdrawalRequest, { 
    foreignKey: 'user_id',
    sourceKey: 'userId'   // This tells Sequelize that User.userId is referenced by withdrawal_requests.user_id
});

module.exports = WithdrawalRequest;