const journals = require("../data/journals");

function createEntry(entry) {
  journals.push(entry);
  return entry;
}

function getEntriesByUser(userId) {
  return journals.filter((j) => j.userId === userId);
}

function deleteEntry(id, userId) {
  const index = journals.findIndex(
    (j) => j.id === id && j.userId === userId
  );
  if (index !== -1) journals.splice(index, 1);
}

function updateEntry(id, userId, updatedData) {
  const entry = journals.find(
    (j) => j.id === id && j.userId === userId
  );
  if (!entry) return null;

  Object.assign(entry, updatedData);
  return entry;
}

module.exports = {
  createEntry,
  getEntriesByUser,
  deleteEntry,
  updateEntry,
};
