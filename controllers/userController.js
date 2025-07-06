import UserModel from "../models/User.js";
import { hashPassword } from "../utils/authUtils.js";

// Get users controller
export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).send(users);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Failed to get users!" });
  }
};

// Update user controller
export const updateUser = async (req, res) => {
  // user id data for edit
  const id = req.params.id;
  //current user who are try to edit
  const tokenUserId = req.userId;

  const currentUser = await UserModel.findOne({ _id: tokenUserId });

  const { password, ...inputs } = req.body;

  if (id !== tokenUserId && currentUser.role !== "admin") {
    return res.status(403).send({ message: "Not Authorized!" });
  }

  let updatedPassword = null;
  // checking for password and if have, hash and update
  try {
    if (password) {
      updatedPassword = await hashPassword(password);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, {
      ...inputs,
      ...(updatedPassword && { password: updatedPassword }),
    });

    const updatedUserInfo = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    };

    res.status(200).send({ updatedUserInfo, message: "Profile Updated" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Failed to update user!" });
  }
};

// Delete user controller
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  const currentUser = await UserModel.findOne({ _id: tokenUserId });

  if (id !== tokenUserId && currentUser.role !== "admin") {
    return res.status(403).send({ message: "Not Authorized!" });
  }

  try {
    await UserModel.findByIdAndDelete(id);
    res.status(200).send({ message: "User deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Failed to delete users!" });
  }
};
