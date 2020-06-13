import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AuthService } from "./service";
import { getErrorCode, buildErrorBody } from "../shared/errors";

export class AuthController {
  static async login(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const service = new AuthService();
    const email = String(req.body.email);
    const pwd = String(req.body.password);
    let tokens;
    try {
      tokens = await service.login(email, pwd);
    } catch (err) {
      return res.status(getErrorCode(err)).json(buildErrorBody(err));
    }
    return res.status(201).json(tokens);
  }

  static async signup(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const service = new AuthService();
    const email = String(req.body.email);
    const pwd = String(req.body.password);
    let tokens;
    try {
      tokens = await service.signup(email, pwd);
    } catch (err) {
      return res.status(getErrorCode(err)).json(buildErrorBody(err));
    }
    return res.status(201).json(tokens);
  }

  static async refresh(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const service = new AuthService();
    const refreshToken = String(req.body.refreshToken);
    let tokens;
    try {
      tokens = await service.refresh(refreshToken);
    } catch (err) {
      return res.status(getErrorCode(err)).json(buildErrorBody(err));
    }

    return res.status(201).json(tokens);
  }
}
