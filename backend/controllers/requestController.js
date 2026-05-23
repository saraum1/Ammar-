const Request = require("../models/request");
const Company = require("../models/company");
const User    = require("../models/user");
const Project = require("../models/project");
exports.createRequest = async (req, res) => {
  try {
    if (req.user.role !== "client")
      return res.status(403).json({ message: "فقط العملاء يمكنهم إرسال طلبات" });
    const { companyId, projectType, location, budget, message } = req.body;
    if (!companyId || !projectType || !location)
      return res.status(400).json({ message: "جميع الحقول المطلوبة يجب تعبئتها" });
    const company = await Company.findOne({ where: { id: companyId, approvalStatus: "approved" } });
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة أو غير مفعّلة" });
    const existing = await Request.findOne({
      where: { client_id: req.user.id, company_id: companyId, status: "pending" }
    });
    if (existing) return res.status(400).json({ message: "أرسلت طلباً لهذه الشركة مسبقاً ولا يزال معلقاً" });
    const request = await Request.create({
      client_id:  req.user.id,
      company_id: companyId,
      projectType,
      location,
      budget,
      message
    });
    res.status(201).json({ status: "success", data: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getClientRequests = async (req, res) => {
  try {
    const requests = await Request.findAll({
      where: { client_id: req.user.id },
      include: [{
        model: Company,
        as: "Company",
        include: [{ model: User, attributes: ["firstName", "lastName", "email", "phone"] }]
      }],
      order: [["createdAt", "DESC"]]
    });
    res.json({ status: "success", data: requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getCompanyRequests = async (req, res) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "لم يتم العثور على بيانات الشركة" });
    const requests = await Request.findAll({
      where: { company_id: company.id },
      include: [{
        model: User,
        as: "Client",
        attributes: ["firstName", "lastName", "email", "phone"]
      }],
      order: [["createdAt", "DESC"]]
    });
    res.json({ status: "success", data: requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, companyNote } = req.body;
    if (!["accepted", "rejected"].includes(status))
      return res.status(400).json({ message: "الحالة يجب أن تكون accepted أو rejected" });
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "لم يتم العثور على بيانات الشركة" });
    const request = await Request.findOne({
      where: { id: req.params.id, company_id: company.id },
      include: [{ model: User, as: "Client", attributes: ["firstName", "lastName"] }]
    });
    if (!request) return res.status(404).json({ message: "الطلب غير موجود" });
    if (request.status === "accepted") {
      const existingProject = await Project.findOne({
        where: { client_id: request.client_id, company_id: company.id }
      });
      if (existingProject) {
        return res.status(400).json({ message: "هذا الطلب مقبول بالفعل وله مشروع" });
      }
      const clientName = request.Client
        ? `${request.Client.firstName || ""} ${request.Client.lastName || ""}`.trim()
        : "عميل";
      const project = await Project.create({
        client_id:  request.client_id,
        company_id: company.id,
        type:       request.projectType,
        clientName,
        location:   request.location,
        budget:     request.budget || ""
      });
      return res.json({ status: "success", data: request, project, note: "تم إنشاء المشروع للطلب القديم" });
    }
    request.status      = status;
    request.companyNote = companyNote || "";
    await request.save();
    let project = null;
    if (status === "accepted") {
      const clientName = request.Client
        ? `${request.Client.firstName || ""} ${request.Client.lastName || ""}`.trim()
        : "عميل";
      project = await Project.create({
        client_id:  request.client_id,
        company_id: company.id,
        type:       request.projectType,
        clientName,
        location:   request.location,
        budget:     request.budget || ""
      });
      await company.increment("projectsCount");
    }
    res.json({ status: "success", data: request, project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};