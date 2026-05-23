require("dotenv").config({ path: "../.env" });
const sequelize = require("../config/db");
const bcrypt    = require("bcryptjs");
const User      = require("../models/user");
async function main() {
  await sequelize.sync({ alter: true });
  const username = "ammar_admin";
  const password = "Admin@2026";
  const exists = await User.findOne({ where: { username } });
  if (exists) {
    console.log("✅ حساب الإدمن موجود مسبقاً —", username);
    process.exit(0);
  }
  const hashed = await bcrypt.hash(password, 10);
  await User.create({
    firstName: "إدارة",
    lastName:  "عمار",
    username,
    email:     "admin@ammar.sa",
    password:  hashed,
    phone:     "0500000000",
    role:      "admin"
  });
  console.log("✅ تم إنشاء حساب الإدمن");
  console.log("   اسم المستخدم:", username);
  console.log("   كلمة المرور:", password);
  console.log("   ⚠️  غيّر كلمة المرور بعد أول تسجيل دخول");
  process.exit(0);
}
main().catch(err => {
  console.error("❌ خطأ:", err.message);
  process.exit(1);
});