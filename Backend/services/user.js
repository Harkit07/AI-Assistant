import User from "../models/user.js";

const createUser = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }
  const user = await User.create({
    name,
    email,
    password,
  });

  return user;
};

export default createUser;