const users = require("../data/users");

function findUserByEmail(email) {
  return users.find((u) => u.email === email);
}

function createUser(user) {
  users.push(user);
  return user;
}

module.exports = {
  findUserByEmail,
  createUser,
};
