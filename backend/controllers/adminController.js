const Company = require("../models/company");
const User    = require("../models/user");
const bcrypt  = require("bcrypt");
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
    res.json({ status: "success", data: companies });
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