import jwt, { TokenExpiredError } from "jsonwebtoken";
import { IPayload, IToken } from "./token.interface";
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
  accessTokenExpiryInSec: number;
  tokenRepo: Repository<UserToken>;
  constructor(
    issuer: string,
    accessTokenSecret: string,
    accessTokenExpiryInSec: number,
    repository: Repository<UserToken>,
  ) {
    this.issuer = issuer;
    this.accessTokenSecret = accessTokenSecret;
    this.accessTokenExpiryInSec = accessTokenExpiryInSec;
    this.tokenRepo = repository;
  }

  /**
   * Generate Access Token and save it in database
   * @param userId Email
   */
  public async generateAccessToken(userId: string): Promise<IToken> {
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
      if (err instanceof TokenExpiredError) {
        throw err;
      }
      throw new TokenVerifyError(err.message);
    }
    return await payload;
  }

  public async getUserIdFromAccessToken(token: string): Promise<string> {
    const payload = jwt.decode(token) as IPayload;
    return payload.user;
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
