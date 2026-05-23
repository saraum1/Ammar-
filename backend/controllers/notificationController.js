const Notification = require("../models/notification");
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 40
    });
    const unread = notifications.filter(n => !n.read).length;
    res.json({ data: notifications, unread });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.markRead = async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { id: req.params.id, user_id: req.user.id } }
    );
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.markAllRead = async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { user_id: req.user.id, read: false } }
    );
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};