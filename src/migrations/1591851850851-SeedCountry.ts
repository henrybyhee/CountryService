import { MigrationInterface, QueryRunner, getRepository } from "typeorm";
import { readFileSync } from "fs";

export class SeedCountry1591851850851 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const countryRepo = await getRepository("country");
    const data = readFileSync("/app/src/seed/country.json", "utf-8");
    const countries = JSON.parse(data);

    const savedCountries = await countryRepo.save(countries);
    console.log(`Saved ${savedCountries.length} countries`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}
