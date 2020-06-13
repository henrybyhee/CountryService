import { Router } from "express";
import { AuthController } from "./controller";
import { check } from "express-validator";

const router = Router();
router.post("/login", [
  check("email").isEmail(),
  check("password").isLength({ min: 9 }),
], AuthController.login);
router.post("/signup", [
  check("email").isEmail(),
  check("password").isLength({ min: 9 }),
], AuthController.signup);

export default router;
