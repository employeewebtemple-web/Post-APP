// models/Support.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Support = sequelize.define("Support", {
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  sender: {                      
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "user"         
  },
  ticketId: {
  type: DataTypes.INTEGER,
  allowNull: true
}
}, {
  tableName: "support",
  timestamps: true
});

module.exports = Support;