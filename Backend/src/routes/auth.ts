import { Router } from "express";
import { z } from "zod";
import { signToken } from "../lib/jwt";
import { validateBody } from "../lib/schemas";
import { asyncHandler } from "../lib/errorHandler";

const router = Router();

const loginSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  email: z.email(),
});

router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { userId, email } = req.body;

    const token = signToken({ userId, email }, "7d");

    res.json({
      token,
      type: "Bearer",
      expiresIn: "7d",
      userId,
    });
  })
);

export default router;
