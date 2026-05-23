const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User    = require("../models/user");
const Company = require("../models/company");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.register = async (req, res) => {
  try {
    const {
      firstName, lastName, username, email, password, phone, role,
      ownerName, type, commercialRegistrationNumber, vatNumber, establishmentNumber
    } = req.body;
    if (!firstName || !lastName || !username || !email || !password || !phone || !role) {
      return res.status(400).json({ message: "جميع الحقول المطلوبة يجب تعبئتها" });
    }
    if (username.length < 3)
      return res.status(400).json({ message: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" });
    if (password.length < 6)
      return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    if (role !== "client" && role !== "company")
      return res.status(400).json({ message: "الدور يجب أن يكون client أو company" });
    if (!/^05\d{8}$/.test(phone))
      return res.status(400).json({ message: "رقم الجوال يجب أن يكون 10 أرقام ويبدأ بـ 05" });
    if (role === "company") {
      if (!ownerName || !type || !commercialRegistrationNumber || !vatNumber || !establishmentNumber)
        return res.status(400).json({ message: "جميع بيانات الشركة مطلوبة" });
      if (isNaN(commercialRegistrationNumber) || isNaN(vatNumber) || isNaN(establishmentNumber))
        return res.status(400).json({ message: "أرقام السجل التجاري والضريبي والمنشأة يجب أن تكون أرقاماً" });
    }
    if (await User.findOne({ where: { email } }))
      return res.status(400).json({ message: "البريد الإلكتروني مستخدم مسبقاً" });
    if (await User.findOne({ where: { username } }))
      return res.status(400).json({ message: "اسم المستخدم مستخدم مسبقاً" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName, lastName, username, email,
      password: hashedPassword, phone, role
    });
    if (role === "company") {
      await Company.create({
        user_id: user.id, ownerName, type,
        commercialRegistrationNumber, vatNumber, establishmentNumber
      });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "7d" }
    );
    res.status(201).json({
      status: "success",
      message: role === "company"
        ? "تم إرسال طلب التسجيل بنجاح! سيتم مراجعة بياناتك والرد عليك قريباً"
        : "تم إنشاء الحساب بنجاح",
      data: { id: user.id, username: user.username, email: user.email, role: user.role, token }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "اسم المستخدم وكلمة المرور مطلوبان" });
    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    if (user.role === "company") {
      const Company = require("../models/company");
      const company = await Company.findOne({ where: { user_id: user.id } });
      if (company && company.approvalStatus === "pending")
        return res.status(403).json({ message: "طلبك قيد المراجعة، سيتم إشعارك عند الموافقة" });
      if (company && company.approvalStatus === "rejected")
        return res.status(403).json({ message: `تم رفض طلبك${company.approvalNote ? ": " + company.approvalNote : ""}` });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "24h" }
    );
    res.status(200).json({
      status: "success",
      message: "تم تسجيل الدخول بنجاح",
      token,
      data: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.uploadRegistrationDoc = async (req, res) => {
  try {
    console.log("[upload-cr-doc] user:", req.user?.id, "| file:", req.file?.filename);
    if (!req.file) {
      console.log("[upload-cr-doc] ❌ لم يصل أي ملف");
      return res.status(400).json({ message: "لم يتم رفع أي ملف" });
    }
    const Company = require("../models/company");
    const company = await Company.findOne({ where: { user_id: req.user.id } });
    if (!company) {
      console.log("[upload-cr-doc] ❌ لم يتم العثور على الشركة للمستخدم:", req.user.id);
      return res.status(404).json({ message: "لم يتم العثور على بيانات الشركة" });
    }
    company.commercialRegistrationFile = `/uploads/documents/${req.file.filename}`;
    await company.save();
    console.log("[upload-cr-doc] ✅ تم الحفظ:", company.commercialRegistrationFile);
    res.json({ status: "success", message: "تم رفع الملف بنجاح" });
  } catch (err) {
    console.error("[upload-cr-doc] ❌ خطأ:", err.message);
    res.status(500).json({ error: err.message });
  }
};
exports.uploadDocByCredentials = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "اسم المستخدم وكلمة المرور مطلوبان" });
    if (!req.file)               return res.status(400).json({ message: "لم يتم رفع أي ملف" });
    const user = await User.findOne({ where: { username } });
    if (!user || user.role !== "company") return res.status(404).json({ message: "الحساب غير موجود" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "كلمة المرور غير صحيحة" });
    const company = await Company.findOne({ where: { user_id: user.id } });
    if (!company) return res.status(404).json({ message: "بيانات الشركة غير موجودة" });
    company.commercialRegistrationFile = `/uploads/documents/${req.file.filename}`;
    await company.save();
    console.log("[upload-doc-credentials] ✅ تم الحفظ للشركة:", user.username);
    res.json({ status: "success", message: "تم رفع ملف السجل التجاري بنجاح ✓" });
  } catch (err) {
    console.error("[upload-doc-credentials] ❌", err.message);
    res.status(500).json({ error: err.message });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });
    if (firstName) user.firstName = firstName;
    if (lastName)  user.lastName  = lastName;
    if (phone) {
      if (!/^05\d{8}$/.test(phone))
        return res.status(400).json({ message: "رقم الجوال يجب أن يكون 10 أرقام ويبدأ بـ 05" });
      user.phone = phone;
    }
    await user.save();
    res.json({
      status: "success",
      message: "تم تحديث البروفايل",
      data: { id: user.id, name: `${user.firstName} ${user.lastName}`, username: user.username, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.logout = async (req, res) => {
  res.status(200).json({ status: "success", message: "تم تسجيل الخروج" });
};
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "البريد الإلكتروني مطلوب" });
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "لا يوجد حساب مرتبط بهذا البريد الإلكتروني" });
    res.status(200).json({
      status: "success",
      message: "تم التحقق من البريد الإلكتروني، يمكنك الآن تعيين كلمة مرور جديدة",
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword || !confirmPassword)
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "كلمتا المرور غير متطابقتين" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "المستخدم غير موجود" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ status: "success", message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword)
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "كلمتا المرور الجديدة غير متطابقتين" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" });
    const user = await User.findByPk(req.user.id);
    if (!user)
      return res.status(404).json({ message: "المستخدم غير موجود" });
    if (!(await bcrypt.compare(currentPassword, user.password)))
      return res.status(401).json({ message: "كلمة المرور الحالية غير صحيحة" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ status: "success", message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.googleAuth = async (req, res) => {
  try {
    const { credential, userInfo } = req.body;
    if (!credential) return res.status(400).json({ message: "بيانات Google مطلوبة" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture: avatar, name } = ticket.getPayload();
    let user = await User.findOne({ where: { googleId } });
    if (!user) user = await User.findOne({ where: { email } });
    if (!user) {
      const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
      let username = baseUsername;
      let counter  = 1;
      while (await User.findOne({ where: { username } })) {
        username = `${baseUsername}_${counter++}`;
      }
      user = await User.create({
        firstName: firstName || name?.split(" ")[0] || "مستخدم",
        lastName:  lastName  || name?.split(" ")[1] || "جوجل",
        username,
        email,
        password: null,
        phone:    null,
        role:     "client",
        googleId,
        avatar:   avatar || null,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (avatar) user.avatar = avatar;
      await user.save();
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "7d" }
    );
    res.json({
      status: "success",
      token,
      data: {
        id:       user.id,
        name:     `${user.firstName} ${user.lastName}`,
        email:    user.email,
        username: user.username,
        role:     user.role,
        avatar:   user.avatar,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};