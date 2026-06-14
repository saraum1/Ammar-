const Project = require("../models/project");
const Company = require("../models/company");
const User    = require("../models/user");
const notify  = require("../helpers/notify");
exports.getClientProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { client_id: req.user.id },
      include: [{
        model: Company,
        as: "Company",
        attributes: ["ownerName", "city", "coverPhoto", "type"]
      }],
      order: [["createdAt", "DESC"]]
    });
    res.json({ status: "success", data: projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getClientProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, client_id: req.user.id },
      include: [{
        model: Company,
        as: "Company",
        attributes: ["ownerName", "city", "coverPhoto", "type"],
        include: [{ model: User, attributes: ["phone", "email"] }]
      }]
    });
    if (!project) return res.status(404).json({ message: "المشروع غير موجود" });
    res.json({ status: "success", data: project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getCompanyProjects = async (req, res) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "لم يتم العثور على بيانات الشركة" });
    const projects = await Project.findAll({
      where: { company_id: company.id },
      include: [{
        model: User,
        as: "Client",
        attributes: ["firstName", "lastName", "phone", "email"]
      }],
      order: [["createdAt", "DESC"]]
    });
    res.json({ status: "success", data: projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getCompanyProject = async (req, res) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "لم يتم العثور على بيانات الشركة" });
    const project = await Project.findOne({
      where: { id: req.params.id, company_id: company.id },
      include: [{
        model: User,
        as: "Client",
        attributes: ["firstName", "lastName", "phone", "email"]
      }]
    });
    if (!project) return res.status(404).json({ message: "المشروع غير موجود" });
    res.json({ status: "success", data: project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updatePhase = async (req, res) => {
  try {
    const { phaseIndex, progress } = req.body;
    if (phaseIndex === undefined || progress === undefined)
      return res.status(400).json({ message: "يجب تحديد المرحلة ونسبة الإنجاز" });
    if (progress < 0 || progress > 100)
      return res.status(400).json({ message: "نسبة الإنجاز بين 0 و 100" });
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "لم يتم العثور على بيانات الشركة" });
    const project = await Project.findOne({
      where: { id: req.params.id, company_id: company.id }
    });
    if (!project) return res.status(404).json({ message: "المشروع غير موجود" });
    const phases = [...project.phases];
    if (!phases[phaseIndex])
      return res.status(400).json({ message: "رقم المرحلة غير صحيح" });
    phases[phaseIndex] = { ...phases[phaseIndex], progress };
    project.phases = phases;
    project.changed("phases", true);
    await project.save();
    await notify(project.client_id, "phase_update",
      `تم تحديث مرحلة "${phases[phaseIndex].name}" إلى ${progress}% في مشروع "${project.type}"`,
      project.id
    );
    res.json({ status: "success", data: project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.addUpdate = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "نص التحديث مطلوب" });
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "لم يتم العثور على بيانات الشركة" });
    const project = await Project.findOne({
      where: { id: req.params.id, company_id: company.id }
    });
    if (!project) return res.status(404).json({ message: "المشروع غير موجود" });
    const updates = [...(project.updates || [])];
    updates.unshift({ text: text.trim(), date: new Date().toISOString() });
    project.updates = updates;
    project.changed("updates", true);
    project.unreadByClient = true;
    await project.save();
    const updated = await Project.findOne({
      where: { id: project.id },
      include: [{ model: User, as: "Client", attributes: ["firstName", "lastName", "phone", "email"] }]
    });
    await notify(project.client_id, "new_update",
      `أضافت الشركة تحديثاً جديداً على مشروع "${project.type}"`,
      project.id
    );
    res.json({ status: "success", data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.addClientNote = async (req, res) => {
  try {
    const text = req.body.text;
    if (!text?.trim()) return res.status(400).json({ message: "النص مطلوب" });
    const project = await Project.findOne({ where: { id: req.params.id, client_id: req.user.id } });
    if (!project) return res.status(404).json({ message: "المشروع غير موجود" });
    const clientNotes = [...(project.clientNotes || [])];
    const newNote = { text: text.trim(), date: new Date().toISOString() };
    if (req.file) newNote.imageUrl = `/uploads/notes/${req.file.filename}`;
    clientNotes.unshift(newNote);
    project.clientNotes = clientNotes;
    project.changed("clientNotes", true);
    project.unreadByCompany = true;
    await project.save();
    const updated = await Project.findOne({
      where: { id: project.id },
      include: [{ model: Company, as: "Company", attributes: ["ownerName", "city", "coverPhoto", "type", "id", "user_id"], include: [{ model: User, attributes: ["phone", "email"] }] }]
    });
    if (updated?.Company?.user_id) {
      const client = await User.findByPk(req.user.id, { attributes: ["firstName", "lastName"] });
      const name = client ? `${client.firstName} ${client.lastName}` : "العميل";
      await notify(updated.Company.user_id, "new_note",
        `أضاف ${name} ملاحظة جديدة على مشروع "${project.type}"`,
        project.id
      );
    }
    res.json({ status: "success", data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateCalculator = async (req, res) => {
  try {
    const { phaseIndex, items } = req.body;
    if (phaseIndex === undefined || !Array.isArray(items))
      return res.status(400).json({ message: "phaseIndex و items مطلوبان" });
    const project = await Project.findOne({ where: { id: req.params.id, client_id: req.user.id } });
    if (!project) return res.status(404).json({ message: "المشروع غير موجود" });
    const calc = { ...(project.calculatorItems || {}) };
    calc[phaseIndex] = items;
    project.calculatorItems = calc;
    project.changed("calculatorItems", true);
    await project.save();
    res.json({ status: "success", data: { calculatorItems: project.calculatorItems } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.markRead = async (req, res) => {
  try {
    const role = req.user.role;
    let project;
    if (role === "client") {
      project = await Project.findOne({ where: { id: req.params.id, client_id: req.user.id } });
      if (!project) return res.status(404).json({ message: "المشروع غير موجود" });
      project.unreadByClient = false;
    } else if (role === "company") {
      const company = await Company.findOne({ where: { user_id: req.user.id } });
      if (!company) return res.status(404).json({ message: "لم يتم العثور على بيانات الشركة" });
      project = await Project.findOne({ where: { id: req.params.id, company_id: company.id } });
      if (!project) return res.status(404).json({ message: "المشروع غير موجود" });
      project.unreadByCompany = false;
    } else {
      return res.status(403).json({ message: "غير مصرح" });
    }
    await project.save();
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "completed", "paused"].includes(status))
      return res.status(400).json({ message: "حالة غير صحيحة" });
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "لم يتم العثور على بيانات الشركة" });
    const project = await Project.findOne({
      where: { id: req.params.id, company_id: company.id }
    });
    if (!project) return res.status(404).json({ message: "المشروع غير موجود" });
    project.status = status;
    await project.save();
    const statusLabel = { active: "جارٍ", completed: "مكتمل", paused: "متوقف" }[status] || status;
    await notify(project.client_id, "status_change",
      `تغيّرت حالة مشروعك "${project.type}" إلى: ${statusLabel}`,
      project.id
    );
    res.json({ status: "success", data: project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};