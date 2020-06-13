export interface IPayload {
  iss: string;
  user: string;
  use: string;
  exp: number;
}

export type IToken = string;

export interface ITokenService {
  generateAccessToken(userId: string): Promise<IToken>;
  verifyAccessToken(token: string): Promise<IPayload>;
  getUserIdFromAccessToken(token: string): Promise<string>;
}
