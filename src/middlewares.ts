import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth/service";
import { getErrorCode, buildErrorBody } from "./shared/errors";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const bearerHeader = req.headers["authorization"];
  if (!bearerHeader) {
    return res.status(403).json({
      "msg": "Token not provided",
    });
  }
  const service = new AuthService();
  const bearerToken = bearerHeader.split(" ")[1];
  try {
    await service.authenticate(bearerToken);
  } catch (err) {
    return res.status(getErrorCode(err)).json(buildErrorBody(err));
  }
  next();
}
