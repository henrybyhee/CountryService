/**
 * Common error cases.
 */
export class NotFoundError extends Error {}
export class WrongInputError extends Error {}
export class TokenVerifyError extends Error {}

export function getErrorCode(err: Error) {
  if (err instanceof NotFoundError) return 404;
  if (err instanceof WrongInputError) return 422;
  if (err instanceof TokenVerifyError) return 403;
  return 500;
}

export interface IErrorBody {
  error: string;
}
export function buildErrorBody(err: Error): IErrorBody {
  return {
    error: err.message,
  };
}
