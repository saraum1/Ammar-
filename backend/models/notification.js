const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");
const Notification = sequelize.define("Notification", {
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  relatedId: {
    type: DataTypes.INTEGER,
    allowNull: true   
  },
  relatedType: {
    type: DataTypes.STRING,
    defaultValue: "project"  
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, { timestamps: true });
User.hasMany(Notification, { foreignKey: "user_id", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "user_id" });
module.exports = Notification;