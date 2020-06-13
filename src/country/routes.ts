import { Router } from "express";
import { CountryController } from "./controller";
import { check, query } from "express-validator";
import { fields } from "./dto";

const sortableFields = fields.concat(
  fields.map((field) => "-" + field),
);

const router = Router();

router.get("/:name", CountryController.get);
router.get(
  "/",
  [
    check("sort").optional().isIn(sortableFields),
    query("limit").optional({ nullable: true }).isInt(),
    query("offset").optional({ nullable: true }).isInt(),
  ],
  CountryController.list,
);

export default router;
