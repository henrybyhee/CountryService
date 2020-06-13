import { Request, Response, NextFunction } from "express";
import { createService } from "./auth/service";
import { getErrorCode, buildErrorBody } from "./shared/errors";
import { IToken } from "./auth/token.interface";

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
  const service = createService();
  const bearerToken = bearerHeader.split(" ")[1];
  let token: IToken;
  try {
    token = await service.authenticate(bearerToken);
  } catch (err) {
    return res.status(getErrorCode(err)).json(buildErrorBody(err));
  }
  res.set("X-NEW-TOKEN", token);
  next();
}
