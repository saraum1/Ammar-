const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");
const Company = require("./company");
const Order = sequelize.define("Order", {
  status: {
    type: DataTypes.ENUM("pending", "confirmed", "shipped", "delivered", "cancelled"),
    defaultValue: "pending"
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  items: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true
});
Order.belongsTo(User,    { foreignKey: "client_id",  as: "Client" });
Order.belongsTo(Company, { foreignKey: "company_id", as: "Company" });
User.hasMany(Order,    { foreignKey: "client_id" });
Company.hasMany(Order, { foreignKey: "company_id" });
module.exports = Order;