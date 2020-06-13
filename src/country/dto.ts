export interface ICountry {
  id: number;
  name: string;
  timezone: string;
  code: string;
  offset: number;
}

export const fields = ["id", "name", "timezone", "code", "offset"];
