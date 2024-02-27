import express from "express";
import { logIn, register } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", logIn);
router.post("/register", register);
// router.post("/logout", logOut);

export default router;
