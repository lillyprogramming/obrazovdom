import express from "express";
import {
  getFamily,
  updateFamily,
  deleteFamMember,
  getFamilyMembers,
  giveStardom,
} from "../controllers/family.js";

const router = express.Router();

router.get("/", getFamily);
router.get("/members", getFamilyMembers);
router.delete("/:id", deleteFamMember);
router.put("/:id", updateFamily);
router.put("/stardom/:id", giveStardom); //функцията за предаване на админ права

export default router;
