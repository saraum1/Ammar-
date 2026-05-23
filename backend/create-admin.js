require("dotenv").config();
const bcrypt    = require("bcryptjs");
const sequelize = require("./config/db");
const User      = require("./models/user");
const [,, username, password] = process.argv;
if (!username || !password) {
  console.error("الاستخدام: node create-admin.js <username> <password>");
  process.exit(1);
}
(async () => {
  try {
    await sequelize.authenticate();
    if (await User.findOne({ where: { username } })) {
      console.error(`❌ اسم المستخدم "${username}" مستخدم مسبقاً`);
      process.exit(1);
    }
    const hashed = await bcrypt.hash(password, 10);
    const admin  = await User.create({
      firstName: "إدارة",
      lastName:  "عمار",
      username,
      email:     `${username}@ammar.sa`,
      password:  hashed,
      phone:     "0500000000",
      role:      "admin"
    });
    console.log(`✅ تم إنشاء حساب الإدمن بنجاح`);
    console.log(`   اسم المستخدم : ${admin.username}`);
    console.log(`   ID           : ${admin.id}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ خطأ:", err.message);
    process.exit(1);
  }
})();