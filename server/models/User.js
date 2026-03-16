// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // your Sequelize instance

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // unique user identifier
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  referral: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  disableIncome: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  disableWithdrawals: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isBlocked:{
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Bank details
  accountNumber: {
    type: DataTypes.STRING,
     allowNull: true,
  },
  ifsc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bankName: {
    type: DataTypes.STRING,
     allowNull: true,
  },
  upiId: {
    type: DataTypes.STRING,
     allowNull: true,
  },

  // Wallet
  walletBalance: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  totalWithdrawn: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
}, {
  tableName: "users",
  timestamps: true,
});

module.exports = User;