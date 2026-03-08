import express from "express";
import {
    register,
    login,
    logout,
    submitVerification,
    getProfile,
} from "../controllers/authControllers.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify", submitVerification);
router.get("/profile/:id", getProfile);

export default router;