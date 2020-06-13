import { ICountry } from "./dto";
import { getRepository, Repository } from "typeorm";
import { Country } from "./entity";
import { buildOrderMap } from "../shared/repository";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { NotFoundError } from "../shared/errors";

export interface ICountryService {
  get(name: string): Promise<ICountry>;
  list(sort: string, limit: number, offset: number): Promise<Array<ICountry>>;
}

/**
 * Inject Dependencies
 */
export function createService(): ICountryService {
  const countryRepository = getRepository(Country);
  return new CountryService(countryRepository);
}

export class CountryService implements ICountryService {
  repository: Repository<Country>;

  constructor(repository: Repository<Country>) {
    this.repository = repository;
  }
  /**
   * Get the country detail or throw execption
   * @param name Name of country
   */
  public async get(name: string): Promise<ICountry> {
    let countryDetail: Country;
    try {
      countryDetail = await this.repository.findOneOrFail({
        name: name,
      });
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new NotFoundError("Country is not found");
      }
      throw err;
    }

    return await countryDetail && {
      id: countryDetail.id,
      name: countryDetail.name,
      timezone: countryDetail.timezone,
      code: countryDetail.code,
      offset: countryDetail.offset,
    };
  }

  /**
   * List all countries
   * @param sort Field to sort by
   * @param limit Pagination
   * @param offset Starting row 
   */
  public async list(
    sort: string,
    limit: number,
    offset: number,
  ): Promise<Array<ICountry>> {
    const orderMap = buildOrderMap(sort);
    const countryList = await this.repository.find({
      order: orderMap,
      skip: offset,
      take: limit,
    });
    return countryList.map((country: Country) => ({
      id: country.id,
      name: country.name,
      timezone: country.timezone,
      code: country.code,
      offset: country.offset,
    }));
  }
}
