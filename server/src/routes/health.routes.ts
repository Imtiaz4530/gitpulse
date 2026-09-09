import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "gitpulse-api",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
