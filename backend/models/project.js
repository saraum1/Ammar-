const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User    = require("./user");
const Company = require("./company");
const DEFAULT_PHASES = [
  { name: "التخطيط والميزانية",  progress: 0 },
  { name: "التصميم الهندسي",     progress: 0 },
  { name: "استخراج التراخيص",   progress: 0 },
  { name: "الحفر والأساسيات",    progress: 0 },
  { name: "الهيكل الإنشائي",    progress: 0 },
  { name: "السقف والبطاقة",      progress: 0 },
  { name: "السباكة والكهرباء",   progress: 0 },
  { name: "العزل والجدران",      progress: 0 },
  { name: "التشطيبات الداخلية",  progress: 0 },
  { name: "التسليم النهائي",     progress: 0 },
];
const Project = sequelize.define("Project", {
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  budget: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("active", "completed", "paused"),
    defaultValue: "active"
  },
  phases: {
    type: DataTypes.JSON,
    defaultValue: DEFAULT_PHASES
  },
  updates: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  clientNotes: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  unreadByCompany: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  unreadByClient: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  calculatorItems: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  timestamps: true
});
User.hasMany(Project,    { foreignKey: "client_id",  as: "ClientProjects",  onDelete: "CASCADE" });
Project.belongsTo(User,  { foreignKey: "client_id",  as: "Client" });
Company.hasMany(Project,    { foreignKey: "company_id", as: "CompanyProjects", onDelete: "CASCADE" });
Project.belongsTo(Company,  { foreignKey: "company_id", as: "Company" });
module.exports = Project;
module.exports.DEFAULT_PHASES = DEFAULT_PHASES;