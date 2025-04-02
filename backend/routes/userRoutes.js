
import express from "express";
import { createUser, updateUser, deleteUser, getUsers, logActivity } from "../controllers/userController.js";
import { authMiddleware, verifySuperAdmin, verifyRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, verifyRole(["super-admin", "sub-admin"]), getUsers);
router.post("/users", authMiddleware, verifySuperAdmin, createUser);
router.get("/sub-admins", authMiddleware, verifySuperAdmin, getUsers); 
router.put("/:id", authMiddleware, verifySuperAdmin, updateUser);
router.delete("/:id", authMiddleware, verifySuperAdmin, deleteUser);
router.get("/activity-logs", authMiddleware, verifySuperAdmin, logActivity);

export default router;
