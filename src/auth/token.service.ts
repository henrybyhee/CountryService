import jwt from "jsonwebtoken";
import { IPayload, ITokens } from "./token.interface";
import { ITokenService } from "./token.interface";
import { getRepository, Repository } from "typeorm";
import { UserToken, TokenUse } from "./entity";
import { NotFoundError, TokenVerifyError } from "../shared/errors";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";

/**
 * TokenService controls all token generation and verification logic, as well as 
 * storage of tokens. Storing token ensures that only one pair of tokens
 * are valid at any given time.
 */
export class TokenService implements ITokenService {
  issuer: string;
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiryInSec: number;
  refreshTokenExpiryInSec: number;
  tokenRepo: Repository<UserToken>;
  constructor(
    issuer: string,
    accessTokenSecret: string,
    refreshTokenSecret: string,
    accessTokenExpiryInSec: number,
    refreshTokenExpiryInSec: number,
  ) {
    this.issuer = issuer;
    this.accessTokenSecret = accessTokenSecret;
    this.refreshTokenSecret = refreshTokenSecret;
    this.accessTokenExpiryInSec = accessTokenExpiryInSec;
    this.refreshTokenExpiryInSec = refreshTokenExpiryInSec;
    this.tokenRepo = getRepository(UserToken);
  }

  public async generateTokens(userId: string): Promise<ITokens> {
    const accessToken = await this.generateAccessToken(userId);
    const refreshToken = await this.generateRefreshToken(userId);
    return await {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  /**
   * Generate Access Token and save it in database
   * @param userId Email
   */
  public async generateAccessToken(userId: string): Promise<string> {
    const time = new Date();
    const exp = Math.floor(time.getTime() / 1000) + this.accessTokenExpiryInSec;
    const newToken = await this.generateToken(
      userId,
      exp,
      "access",
      this.accessTokenSecret,
    );
    try {
      // Revoke all access tokens
      const updated = await this.tokenRepo.update({
        email: userId,
        use: TokenUse.ACCESS,
      }, { revoked: true });
      console.log(`Revoked all ${updated.affected} tokens`);

      // Insert new token
      await this.tokenRepo.save({
        email: userId,
        use: TokenUse.ACCESS,
        token: newToken,
        revoked: false,
      });
      console.log(`Added access token for userId ${userId}`);
    } catch (err) {
      console.log(
        `Error Revoking past token and adding new token: ${err.message}`,
      );
    }
    return await newToken;
  }

  /**
   * Generate Refresh Token and save it in database
   * @param userId Email
   */
  public async generateRefreshToken(userId: string): Promise<string> {
    const time = new Date();
    const exp = Math.floor(time.getTime() / 1000) +
      this.refreshTokenExpiryInSec;
    const newToken = await this.generateToken(
      userId,
      exp,
      "refresh",
      this.refreshTokenSecret,
    );
    try {
      // Revoke all access tokens
      const updated = await this.tokenRepo.update({
        email: userId,
        use: TokenUse.REFRESH,
      }, { revoked: true });
      console.log(`Revoked all ${updated.affected} tokens`);

      // Insert new token
      await this.tokenRepo.save({
        email: userId,
        use: TokenUse.REFRESH,
        token: newToken,
        revoked: false,
      });
      console.log(`Added refresh token for userId ${userId}`);
    } catch (err) {
      console.log(
        `Error Revoking past token and adding new token: ${err.message}`,
      );
    }
    return await newToken;
  }

  /**
   * Check if token has been revoked then verify. If verify success,
   * return payload else revoked this token.
   * @param token access token
   * @throws {NotFoundError} TOken not found in database
   * @throws {TokenVerifyError} Token is revoked or verification failed.
   * @throws {Error} Uncaught Error
   */
  public async verifyAccessToken(token: string): Promise<IPayload> {
    // Does token exist?
    let tokenRow: UserToken;
    try {
      tokenRow = await this.tokenRepo.findOneOrFail({
        token: token,
      });
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new NotFoundError("Token is not found");
      }
      throw err;
    }
    // Check if revoked
    if (tokenRow.revoked) {
      throw new TokenVerifyError("Token has been revoked");
    }
    let payload: IPayload;
    try {
      payload = jwt.verify(token, this.accessTokenSecret) as IPayload;
    } catch (err) {
      await this.tokenRepo.update({
        token: token,
      }, { revoked: true });
      console.log(`Verify failed. Revoked token`);
      throw new TokenVerifyError(err.message);
    }
    return await payload;
  }

  /**
   * Check if token has been revoked then verify. If verify success,
   * return payload else revoked this token.
   * @param token refresh token
   * @throws {NotFoundError} Token not found
   * @throws {TokenVerifyError} Token is revoked or verification failed.
   * @throws {Error} Uncaught Error
   */
  public async verifyRefreshToken(token: string): Promise<IPayload> {
    // Does token exist?
    let tokenRow: UserToken;
    try {
      tokenRow = await this.tokenRepo.findOneOrFail({
        token: token,
      });
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new NotFoundError("Token is not found");
      }
      throw err;
    }
    // Check if revoked
    if (tokenRow.revoked) {
      throw new TokenVerifyError("Token has been revoked");
    }
    let payload: IPayload;
    try {
      payload = jwt.verify(token, this.refreshTokenSecret) as IPayload;
    } catch (err) {
      await this.tokenRepo.update({
        token: token,
      }, { revoked: true });
      throw new TokenVerifyError(err.message);
    }
    return await payload;
  }

  async generateToken(
    userId: string,
    expiry: number,
    use: string,
    secret: string,
  ): Promise<string> {
    const payload: IPayload = {
      iss: this.issuer,
      use: use,
      user: userId,
      exp: expiry,
    };
    return await jwt.sign(payload, secret);
  }
}
