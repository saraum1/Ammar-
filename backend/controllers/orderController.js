const Order        = require("../models/order");
const Product      = require("../models/product");
const Company      = require("../models/company");
const User         = require("../models/user");
const Notification = require("../models/notification");
const createOrder = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "فقط العملاء يمكنهم إنشاء طلبات" });
    }
    const { companyId, items, address, notes } = req.body;
    if (!companyId || !items || !Array.isArray(items) || items.length === 0 || !address) {
      return res.status(400).json({ message: "معرف الشركة والمنتجات والعنوان مطلوبة" });
    }
    let totalPrice = 0;
    const resolvedItems = [];
    for (const item of items) {
      const product = await Product.findOne({
        where: { id: item.productId, company_id: companyId, inStock: true }
      });
      if (!product) {
        return res.status(404).json({
          message: `المنتج ذو المعرف ${item.productId} غير موجود أو غير متوفر`
        });
      }
      const qty = item.qty || 1;
      totalPrice += product.price * qty;
      resolvedItems.push({
        productId: product.id,
        name:      product.name,
        qty,
        unitPrice: product.price
      });
    }
    const order = await Order.create({
      status:     "pending",
      totalPrice,
      address,
      notes:      notes || null,
      items:      resolvedItems,
      client_id:  req.user.id,
      company_id: companyId
    });

    // Notify the company owner about the new order
    try {
      const companyRecord = await Company.findOne({ where: { id: companyId } });
      console.log("🔔 companyRecord:", companyRecord?.id, "user_id:", companyRecord?.user_id);
      if (companyRecord) {
        const ownerUserId = companyRecord.get("user_id");
        console.log("🔔 ownerUserId:", ownerUserId);
        const clientUser = await User.findByPk(req.user.id);
        const clientName = clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : "عميل";
        const notif = await Notification.create({
          type:        "new_order",
          message:     `طلب جديد من ${clientName} بقيمة ${totalPrice.toFixed(2)} ر.س`,
          relatedId:   order.id,
          relatedType: "order",
          user_id:     ownerUserId
        });
        console.log("✅ تم إنشاء الإشعار:", notif.id, "لليوزر:", ownerUserId);
      } else {
        console.log("❌ الشركة غير موجودة بالـ id:", companyId);
      }
    } catch (notifErr) {
      console.error("❌ خطأ في إنشاء الإشعار:", notifErr.message, notifErr.stack);
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getClientOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { client_id: req.user.id },
      include: [
        {
          model: Company,
          as: "Company",
          attributes: ["id", "ownerName"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getCompanyOrders = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "فقط الشركات يمكنها عرض طلباتها" });
    }
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) {
      return res.status(404).json({ message: "لم يتم العثور على الشركة" });
    }
    const orders = await Order.findAll({
      where: { company_id: company.id },
      include: [
        {
          model: User,
          as: "Client",
          attributes: ["id", "firstName", "lastName", "phone"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "فقط الشركات يمكنها تحديث حالة الطلبات" });
    }
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) {
      return res.status(404).json({ message: "لم يتم العثور على الشركة" });
    }
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: "حالة الطلب غير صالحة" });
    }
    const order = await Order.findOne({
      where: { id: req.params.id, company_id: company.id }
    });
    if (!order) {
      return res.status(404).json({ message: "الطلب غير موجود أو لا تملك صلاحية تعديله" });
    }
    await order.update({ status });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = { createOrder, getClientOrders, getCompanyOrders, updateOrderStatus };