import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import { comparePassword } from "../utils/authUtils.js";

// register new user
const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User exists" });
    }

    // HASH THE PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);
    // CREATE A NEW USER AND SAVE TO DB
    const newUser = await new UserModel({
      username,
      email,
      password: hashedPassword,
    }).save();

    // GENERATE COOKIE TOKEN AND SEND TO THE USER
    const age = 100 * 60 * 60 * 24 * 7;

    const token = jwt.sign(
      {
        id: newUser.id,
        isAdmin: false,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );

    const userInfo = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      token: token,
    };

    res.status(200).send({ userInfo, message: "User created successfully" });
  } catch (err) {
    res.status(500).send({ message: "Failed to create user!" });
  }
};

// Login for user
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // CHECK IF THE USER EXISTS
    const user = await UserModel.findOne({ email });

    if (!user) return res.status(400).send({ message: "Invalid Credentials!" });

    // CHECK IF THE PASSWORD IS CORRECT
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid)
      return res.status(400).send({ message: "Invalid Credentials!" });

    // GENERATE TOKEN AND SEND TO THE USER **not using cookie, web and mobile interface
    const age = 100 * 60 * 60 * 24 * 7;

    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: false,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );
    const userInfo = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: token,
    };
    res.status(200).send(userInfo);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Failed to login!" });
  }
};

export { login, register };
