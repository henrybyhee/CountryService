import { Request, Response } from "express";
import { CountryService } from "./service";
import { ICountry } from "./dto";
import { validationResult } from "express-validator";
import { getErrorCode, buildErrorBody } from "../shared/errors";

export class CountryController {
  /**
   * GET /countries/:name
   */
  static async get(req: Request, res: Response) {
    const { name } = req.params;
    let country: ICountry;
    try {
      const service = new CountryService();
      country = await service.get(name);
    } catch (err) {
      return res.status(getErrorCode(err)).json(buildErrorBody(err));
    }
    return res.status(200).json({
      "data": country,
    });
  }

  /**
   * GET /countries/
   */
  static async list(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { limit, offset, sort } = req.query;
    let countryList;
    try {
      const service = new CountryService();
      countryList = await service.list(
        !sort ? "id" : String(sort),
        !limit ? 10 : Number(limit),
        !offset ? 0 : Number(offset),
      );
    } catch (err) {
      return res.status(getErrorCode(err)).json(buildErrorBody(err));
    }
    return res.status(200).json({
      "data": countryList,
    });
  }
}
