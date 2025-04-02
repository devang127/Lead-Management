
import express from "express";
import { authMiddleware, verifyRole } from "../middleware/authMiddleware.js";
import { createLead, getLeads, updateLead, deleteLead, getTags, exportLeads } from "../controllers/leadController.js";

const router = express.Router();

router.post("/", authMiddleware, verifyRole(["super-admin", "sub-admin", "support-agent"]), createLead);
router.get("/", authMiddleware, getLeads);
router.put("/:id", authMiddleware, verifyRole(["super-admin", "sub-admin", "support-agent"]), updateLead);
router.delete("/:id", authMiddleware, verifyRole(["super-admin", "sub-admin"]), deleteLead);
router.get("/tags", authMiddleware, getTags);

router.get("/export", authMiddleware, exportLeads);
export default router;