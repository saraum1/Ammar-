const Note = require("../models/note");
const getNotes = async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { user_id: req.user.id },
      order: [["createdAt", "DESC"]]
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const createNote = async (req, res) => {
  try {
    const { title, phase, content, imageUrl } = req.body;
    if (!title) {
      return res.status(400).json({ message: "العنوان مطلوب" });
    }
    const note = await Note.create({
      title,
      phase:    phase    || null,
      content:  content  || null,
      imageUrl: imageUrl || null,
      user_id:  req.user.id
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });
    if (!note) {
      return res.status(404).json({ message: "الملاحظة غير موجودة أو لا تملك صلاحية حذفها" });
    }
    await note.destroy();
    res.json({ message: "تم حذف الملاحظة بنجاح" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = { getNotes, createNote, deleteNote };