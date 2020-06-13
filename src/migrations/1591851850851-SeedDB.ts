import { MigrationInterface, QueryRunner, getRepository } from "typeorm";
import { readFileSync } from "fs";
import bcrypt from "bcrypt";

export class SeedDB1591851850851 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const countryRepo = await getRepository("country");
    const data = readFileSync("/app/src/seed/country.json", "utf-8");
    const countries = JSON.parse(data);

    const savedCountries = await countryRepo.save(countries);

    console.log(`Saved ${savedCountries.length} countries`);

    const userRepo = await getRepository("user");
    const hashedPassword = await bcrypt.hash("password12345", 10);
    await userRepo.save({
      email: "admin@resync.io",
      password: hashedPassword,
    });

    console.log(`added user.`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}
