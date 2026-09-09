import { Router } from "express";

import {
  login,
  logout,
  refresh,
  register,
} from "../controllers/auth.controller.js";

import { authRateLimiter } from "../middlewares/rate-limit.middleware.js";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/refresh", authRateLimiter, refresh);
router.post("/logout", logout);

export default router;
