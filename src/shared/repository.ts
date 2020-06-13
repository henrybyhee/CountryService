/**
 * Commonly used functions for repositories
 */
interface IOrderMap {
  [key: string]: string;
}

export function buildOrderMap(field: string): IOrderMap {
  if (!field) return {};
  let orderMap: IOrderMap = {};
  if (field[0] === "-") {
    orderMap[field.slice(1)] = "DESC";
  } else {
    orderMap[field] = "ASC";
  }
  return orderMap;
}
