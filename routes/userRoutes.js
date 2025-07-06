import express from "express";
import { verifyToken } from "../utils/authUtils.js";
import {
  deleteUser,
  getUsers,
  updateUser,
} from "../controllers/userController.js";
const router = express.Router();

router.get("/", verifyToken, getUsers);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);

export default router;
