import express from "express";
import bodyParser from "body-parser";
import CountryRouter from "./country/routes";
import AuthRouter from "./auth/routes";
import { authenticate } from "./middlewares";

const app = express();
app.use(bodyParser.json());
app.use("/oauth", AuthRouter);
app.use("/api/countries", authenticate, CountryRouter);

export default app;