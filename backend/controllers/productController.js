const Product = require("../models/product");
const Company = require("../models/company");
const { Op }  = require("sequelize");
const getCompanyProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { company_id: req.params.companyId, inStock: true },
      order: [["createdAt", "DESC"]]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getMyProducts = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "فقط الشركات يمكنها الوصول لهذا المسار" });
    }
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "لم يتم العثور على الشركة" });
    const products = await Product.findAll({
      where: { company_id: company.id },
      order: [["createdAt", "DESC"]]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getOwnedCompany = async (userId) => {
  return Company.findOne({ where: { user_id: userId } });
};
const addProduct = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "فقط الشركات يمكنها إضافة منتجات" });
    }
    const company = await getOwnedCompany(req.user.id);
    if (!company) {
      return res.status(404).json({ message: "لم يتم العثور على الشركة" });
    }
    const { name, description, price, unit, category, inStock } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: "اسم المنتج والسعر مطلوبان" });
    }
    const imageUrl = req.body.imageUrl || null;
    const product = await Product.create({
      name,
      description: description || null,
      price,
      unit:        unit        || "وحدة",
      category:    category    || null,
      imageUrl,
      inStock:     inStock !== undefined ? inStock : true,
      company_id:  company.id
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const updateProduct = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "فقط الشركات يمكنها تعديل المنتجات" });
    }
    const company = await getOwnedCompany(req.user.id);
    if (!company) {
      return res.status(404).json({ message: "لم يتم العثور على الشركة" });
    }
    const product = await Product.findOne({
      where: { id: req.params.id, company_id: company.id }
    });
    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود أو لا تملك صلاحية تعديله" });
    }
    const { name, description, price, unit, category, inStock } = req.body;
    const imageUrl = req.body.imageUrl !== undefined ? req.body.imageUrl : product.imageUrl;
    await product.update({
      name:        name        !== undefined ? name        : product.name,
      description: description !== undefined ? description : product.description,
      price:       price       !== undefined ? price       : product.price,
      unit:        unit        !== undefined ? unit        : product.unit,
      category:    category    !== undefined ? category    : product.category,
      imageUrl,
      inStock:     inStock     !== undefined ? inStock     : product.inStock
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "فقط الشركات يمكنها حذف المنتجات" });
    }
    const company = await getOwnedCompany(req.user.id);
    if (!company) {
      return res.status(404).json({ message: "لم يتم العثور على الشركة" });
    }
    const product = await Product.findOne({
      where: { id: req.params.id, company_id: company.id }
    });
    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود أو لا تملك صلاحية حذفه" });
    }
    await product.destroy();
    res.json({ message: "تم حذف المنتج بنجاح" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const searchProducts = async (req, res) => {
  try {
    const { q, category } = req.query;
    const where = { inStock: true };
    if (q) {
      where[Op.or] = [
        { name:        { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { category:    { [Op.iLike]: `%${q}%` } }
      ];
    }
    if (category && category !== "الكل") {
      where.category = { [Op.iLike]: `%${category}%` };
    }
    const products = await Product.findAll({
      where,
      include: [{
        model: Company,
        where: { type: "materials_supplier" },
        attributes: ["id", "ownerName", "city", "coverPhoto"]
      }],
      order: [["createdAt", "DESC"]]
    });
    res.json({ data: products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = { getCompanyProducts, getMyProducts, addProduct, updateProduct, deleteProduct, searchProducts };