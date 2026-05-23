const Notification = require("../models/notification");
async function notify(userId, type, message, relatedId = null, relatedType = "project") {
  try {
    await Notification.create({ user_id: userId, type, message, relatedId, relatedType });
  } catch (e) {
    console.error("[notify] فشل إنشاء الإشعار:", e.message);
  }
}
module.exports = notify;