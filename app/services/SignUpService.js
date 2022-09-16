const moment = require("moment");
const Password = require("../helpers/Password");
const Users = require("../models/Users");

const rules = {
  fullName: "required|min:3",
  emailAddress: "required|email",
  password:
    "required|regex:/^(?=.*\\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$",
};

const errors = {
  1: { code: "ERR-SIGNUP-01", message: "This email address already exists" },
};

const isEmailAddressExists = async emailAddress => {
  const user = await Users.query()
    .select("id")
    .where("email_address", emailAddress);

  if (user.length === 0) {
    return false;
  } else {
    return true;
  }
};

const createUser = async body => {
  const { fullName, emailAddress, password } = body;

  const newUser = await Users.query().insert({
    full_name: fullName,
    email_address: emailAddress,
    password: Password.make(password),
    logged_in_at: moment().format(),
  });

  if (newUser) {
    return {
      id: newUser.id,
      full_name: newUser.full_name,
      email_address: newUser.email_address,
      sso_provider: newUser.sso_provider || null,
      image_url: newUser.image_url || "",
      country: newUser.country || "",
      verified_at: newUser.verified_at || null,
      logged_in_at: newUser.logged_in_at,
    };
  }

  return;
};

module.exports = {
  rules,
  errors,
  isEmailAddressExists,
  createUser,
};
