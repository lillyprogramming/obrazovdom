import express from "express";
import { getToBuys, addToBuy, deleteToBuy } from "../controllers/grocery.js";

const router = express.Router();

router.get("/", getToBuys);
router.post("/", addToBuy);
router.delete("/:id", deleteToBuy);

export default router;
