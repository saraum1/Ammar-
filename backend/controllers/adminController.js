const Company = require("../models/company");
const User    = require("../models/user");
const Request = require("../models/request");
const bcrypt  = require("bcryptjs");
const { Op }  = require("sequelize");

exports.getPendingCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      where: { approvalStatus: "pending" },
      include: [{ model: User, attributes: ["firstName", "lastName", "email", "phone", "username", "createdAt"] }],
      order: [["createdAt", "DESC"]]
    });
    res.json({ status: "success", data: companies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      include: [{ model: User, attributes: ["firstName", "lastName", "email", "phone", "username"] }],
      order: [["createdAt", "DESC"]]
    });

    // Add client count for each company
    const data = await Promise.all(companies.map(async (c) => {
      const clientCount = await Request.count({
        where: { company_id: c.id },
        distinct: true,
        col: "client_id"
      });
      return { ...c.toJSON(), clientCount };
    }));

    res.json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة" });
    company.approvalStatus = "approved";
    company.approvalNote   = req.body.note || "";
    await company.save();
    res.json({ status: "success", message: "تمت الموافقة على الشركة" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rejectCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة" });
    company.approvalStatus = "rejected";
    company.approvalNote   = req.body.note || "لم يتم قبول الطلب";
    await company.save();
    res.json({ status: "success", message: "تم رفض الشركة" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get companies requesting deletion
exports.getDeleteRequests = async (req, res) => {
  try {
    const companies = await Company.findAll({
      where: { deleteRequested: true },
      include: [{ model: User, attributes: ["firstName", "lastName", "email", "phone", "username"] }],
      order: [["updatedAt", "DESC"]]
    });

    const data = await Promise.all(companies.map(async (c) => {
      const clientCount = await Request.count({
        where: { company_id: c.id },
        distinct: true,
        col: "client_id"
      });
      return { ...c.toJSON(), clientCount };
    }));

    res.json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin deletes a company
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة" });
    const user = await User.findByPk(company.user_id);
    await company.destroy();
    if (user) await user.destroy();
    res.json({ status: "success", message: "تم حذف الشركة بنجاح" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin rejects delete request
exports.rejectDeleteRequest = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة" });
    company.deleteRequested = false;
    company.deleteRequestNote = null;
    await company.save();
    res.json({ status: "success", message: "تم رفض طلب الحذف" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { username, password, secretKey } = req.body;
    if (secretKey !== (process.env.ADMIN_SECRET || "ammar_admin_2026"))
      return res.status(403).json({ message: "المفتاح السري غلط" });
    if (await User.findOne({ where: { username } }))
      return res.status(400).json({ message: "اسم المستخدم مستخدم" });
    const hashed = await bcrypt.hash(password, 10);
    const admin  = await User.create({
      firstName: "إدارة",
      lastName:  "عمار",
      username,
      email:    `${username}@ammar.sa`,
      password: hashed,
      phone:    "0500000000",
      role:     "admin"
    });
    res.status(201).json({ status: "success", message: "تم إنشاء حساب الإدمن", id: admin.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
