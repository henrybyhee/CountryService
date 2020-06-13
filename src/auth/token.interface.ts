export interface IPayload {
  iss: string;
  user: string;
  use: string;
  exp: number;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenService {
  generateTokens(userId: string): Promise<ITokens>;
  generateAccessToken(userId: string): Promise<string>;
  generateRefreshToken(userId: string): Promise<string>;
  verifyAccessToken(token: string): Promise<IPayload>;
  verifyRefreshToken(token: string): Promise<IPayload>;
}
