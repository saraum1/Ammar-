const Meeting = require("../models/meeting");
const Project = require("../models/project");
const Company = require("../models/company");
const User    = require("../models/user");
const notify  = require("../helpers/notify");
exports.proposeMeeting = async (req, res) => {
  try {
    const { projectId, proposedDate, proposedTime, topic } = req.body;
    if (!projectId || !proposedDate || !proposedTime || !topic?.trim())
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    const project = await Project.findOne({
      where: { id: projectId, client_id: req.user.id },
      include: [{ model: Company, as: "Company" }]
    });
    if (!project) return res.status(404).json({ message: "المشروع غير موجود" });
    const meeting = await Meeting.create({
      proposedDate, proposedTime, topic: topic.trim(),
      status:     "pending",
      client_id:  req.user.id,
      company_id: project.company_id,
      project_id: projectId
    });
    const client = await User.findByPk(req.user.id, { attributes: ["firstName", "lastName"] });
    const name   = client ? `${client.firstName} ${client.lastName}` : "العميل";
    await notify(
      project.Company.user_id, "new_meeting",
      `طلب ${name} حجز اجتماع بتاريخ ${proposedDate} الساعة ${proposedTime} — ${topic.trim()}`,
      meeting.id, "meeting"
    );
    const full = await Meeting.findByPk(meeting.id, {
      include: [
        { model: Company, as: "Company", attributes: ["ownerName"] },
        { model: User,    as: "Client",  attributes: ["firstName", "lastName"] }
      ]
    });
    res.status(201).json({ status: "success", data: full });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.companyProposeMeeting = async (req, res) => {
  try {
    const { projectId, proposedDate, proposedTime, topic, meetLink } = req.body;
    if (!projectId || !proposedDate || !proposedTime || !topic?.trim())
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    if (!meetLink?.trim())
      return res.status(400).json({ message: "رابط الاجتماع إلزامي" });
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة" });
    const project = await Project.findOne({
      where: { id: projectId, company_id: company.id }
    });
    if (!project) return res.status(404).json({ message: "المشروع غير موجود" });
    const meeting = await Meeting.create({
      proposedDate, proposedTime,
      topic:    topic.trim(),
      meetLink: meetLink.trim(),
      status:   "confirmed",
      client_id:  project.client_id,
      company_id: company.id,
      project_id: projectId
    });
    await notify(
      project.client_id, "meeting_confirmed",
      `حددت ${company.ownerName} موعد اجتماع بتاريخ ${proposedDate} ${proposedTime} — ${topic.trim()}`,
      meeting.id, "meeting"
    );
    res.status(201).json({ status: "success", data: meeting });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getClientMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.findAll({
      where: { client_id: req.user.id },
      include: [{ model: Company, as: "Company", attributes: ["ownerName", "city"] }],
      order: [["proposedDate", "DESC"]]
    });
    res.json({ status: "success", data: meetings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getCompanyMeetings = async (req, res) => {
  try {
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة" });
    const meetings = await Meeting.findAll({
      where: { company_id: company.id },
      include: [{ model: User, as: "Client", attributes: ["firstName", "lastName", "phone"] }],
      order: [["proposedDate", "ASC"]]
    });
    res.json({ status: "success", data: meetings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateMeetingStatus = async (req, res) => {
  try {
    const { status, companyNote, meetLink } = req.body;
    if (!["confirmed", "declined"].includes(status))
      return res.status(400).json({ message: "حالة غير صحيحة" });
    if (status === "confirmed" && !meetLink?.trim())
      return res.status(400).json({ message: "رابط الاجتماع إلزامي عند التأكيد" });
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) return res.status(404).json({ message: "الشركة غير موجودة" });
    const meeting = await Meeting.findOne({ where: { id: req.params.id, company_id: company.id } });
    if (!meeting) return res.status(404).json({ message: "الاجتماع غير موجود" });
    meeting.status      = status;
    meeting.companyNote = companyNote || null;
    meeting.meetLink    = meetLink    || null;
    await meeting.save();
    const msg = status === "confirmed"
      ? `تم تأكيد اجتماعك مع ${company.ownerName} بتاريخ ${meeting.proposedDate} — الرابط جاهز`
      : `اعتذرت ${company.ownerName} عن موعد الاجتماع${companyNote ? `: ${companyNote}` : ""}`;
    await notify(meeting.client_id, `meeting_${status}`, msg, meeting.id, "meeting");
    res.json({ status: "success", data: meeting });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};