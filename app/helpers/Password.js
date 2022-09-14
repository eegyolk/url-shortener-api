const bcrypt = require("bcryptjs");

const make = password => {
  const salt = bcrypt.genSaltSync();

  return bcrypt.hashSync(password, salt);
};

const check = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

module.exports = {
  make,
  check,
};
