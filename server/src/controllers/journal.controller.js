const journalService = require("../services/journal.service");

let idCounter = 1;

function createJournal(req, res) {
  const { title, content, mood, intensity, tags } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title & content required" });
  }

  const entry = {
    id: idCounter++,
    userId: req.user.id,
    title,
    content,
    mood,
    intensity,
    tags: tags || [],
    date: new Date().toISOString(),
  };

  journalService.createEntry(entry);
  res.status(201).json(entry);
}

function getMyJournals(req, res) {
  const entries = journalService.getEntriesByUser(req.user.id);
  res.json(entries);
}

function deleteJournal(req, res) {
  const id = Number(req.params.id);
  journalService.deleteEntry(id, req.user.id);
  res.json({ message: "Deleted" });
}

function updateJournal(req, res) {
  const id = Number(req.params.id);
  const updated = journalService.updateEntry(
    id,
    req.user.id,
    req.body
  );

  if (!updated)
    return res.status(404).json({ message: "Entry not found" });

  res.json(updated);
}

module.exports = {
  createJournal,
  getMyJournals,
  deleteJournal,
  updateJournal,
};
