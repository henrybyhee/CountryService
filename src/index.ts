import app from "./app";
import "reflect-metadata";
import { createConnection } from "typeorm";
import fs from "fs";

const dbConfig = {
  type: "mysql",
  host: process.env.DB_HOST || "db",
  port: 3306,
  username: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "",
  synchronize: true, // unsafe for production
  entities: [
    "dist/**/*/entity.js",
  ],
  migrations: [
    "dist/migrations/*.js",
  ],
  cli: {
    migrationsDir: "migrations",
  },
};



// Build ormconfig.js file if it is missing.
if (!fs.existsSync("/app/ormconfig.json")) {
  console.log("Writing ormConfig.json file...");
  try {
    fs.writeFileSync("/app/ormconfig.json", JSON.stringify(dbConfig));
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}
createConnection().then((connection) => {
  console.log("DB connection is alive!");
}).catch((err) => {
  console.log(err);
});

app.listen(3000, () => {
  console.log("Country service is alive!");
});
