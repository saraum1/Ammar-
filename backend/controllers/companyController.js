const Company = require("../models/company");
const User    = require("../models/user");
exports.getCompanies = async (req, res) => {
  try {
    const { type, category } = req.query;
    const where = { approvalStatus: "approved" };
    if (type) where.type = type;
    let companies = await Company.findAll({
      where,
      include: [{ model: User, attributes: ["firstName", "lastName", "email", "phone"] }],
      order: [["rating", "DESC"], ["createdAt", "DESC"]]
    });
    if (category && category !== "الكل") {
      companies = companies.filter(c =>
        Array.isArray(c.categories) && c.categories.includes(category)
      );
    }
    res.json({ status: "success", data: companies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findOne({
      where: { id: req.params.id, approvalStatus: "approved" },
      include: [{ model: User, attributes: ["firstName", "lastName", "email", "phone"] }]
    });
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة" });
    res.json({ status: "success", data: company });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getMyProfile = async (req, res) => {
  try {
    const company = await Company.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, attributes: ["firstName", "lastName", "email", "phone", "username"] }]
    });
    if (!company) return res.status(404).json({ message: "لم يتم العثور على بيانات الشركة" });
    res.json({ status: "success", data: company });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateMyProfile = async (req, res) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "لم يتم العثور على بيانات الشركة" });
    const { description, specializations, city, categories } = req.body;
    if (description     !== undefined) company.description     = description;
    if (city            !== undefined) company.city            = city;
    if (specializations !== undefined) {
      company.specializations = Array.isArray(specializations)
        ? specializations
        : specializations.split(/[,،]+/).map(s => s.trim()).filter(Boolean);
    }
    if (categories !== undefined) {
      company.categories = Array.isArray(categories)
        ? categories
        : categories.split(/[,،]+/).map(s => s.trim()).filter(Boolean);
    }
    if (req.file) company.coverPhoto = `/uploads/covers/${req.file.filename}`;
    await company.save();
    res.json({ status: "success", data: company });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.uploadCover = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "لم يتم رفع أي صورة" });
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "لم يتم العثور على بيانات الشركة" });
    company.coverPhoto = `/uploads/covers/${req.file.filename}`;
    await company.save();
    res.json({ status: "success", coverPhoto: company.coverPhoto });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};