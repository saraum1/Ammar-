const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User    = require("./user");
const Company = require("./company");
const Project = require("./project");
const Meeting = sequelize.define("Meeting", {
  proposedDate: { type: DataTypes.DATEONLY,  allowNull: false },
  proposedTime: { type: DataTypes.STRING(10), allowNull: false },
  topic:        { type: DataTypes.STRING,     allowNull: false },
  status: {
    type: DataTypes.ENUM("pending", "confirmed", "declined"),
    defaultValue: "pending"
  },
  companyNote: { type: DataTypes.STRING, allowNull: true },
  meetLink:    { type: DataTypes.STRING, allowNull: true }
}, { timestamps: true });
User.hasMany(Meeting,    { foreignKey: "client_id",  as: "ClientMeetings"  });
Meeting.belongsTo(User,  { foreignKey: "client_id",  as: "Client" });
Company.hasMany(Meeting,    { foreignKey: "company_id", as: "CompanyMeetings" });
Meeting.belongsTo(Company,  { foreignKey: "company_id", as: "Company" });
Project.hasMany(Meeting,    { foreignKey: "project_id" });
Meeting.belongsTo(Project,  { foreignKey: "project_id" });
module.exports = Meeting;