import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AuthService, createService } from "./service";
import { getErrorCode, buildErrorBody } from "../shared/errors";

export class AuthController {
  static async login(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const email = String(req.body.email);
    const pwd = String(req.body.password);
    let token;
    try {
      const service = createService();
      token = await service.login(email, pwd);
    } catch (err) {
      return res.status(getErrorCode(err)).json(buildErrorBody(err));
    }
    return res.status(201).json({
      accessToken: token,
    });
  }

  static async signup(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const service = createService();
    const email = String(req.body.email);
    const pwd = String(req.body.password);
    let token;
    try {
      token = await service.signup(email, pwd);
    } catch (err) {
      return res.status(getErrorCode(err)).json(buildErrorBody(err));
    }
    return res.status(201).json({
      accessToken: token,
    });
  }
}
