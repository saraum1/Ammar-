const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User    = require("./user");
const Company = require("./company");
const Request = sequelize.define("Request", {
  projectType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  budget: {
    type: DataTypes.STRING,
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "rejected"),
    defaultValue: "pending"
  },
  companyNote: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});
User.hasMany(Request,    { foreignKey: "client_id",  as: "ClientRequests" });
Request.belongsTo(User,  { foreignKey: "client_id",  as: "Client" });
Company.hasMany(Request,    { foreignKey: "company_id", as: "CompanyRequests" });
Request.belongsTo(Company,  { foreignKey: "company_id", as: "Company" });
module.exports = Request;