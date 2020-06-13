import { TokenExpiredError } from "jsonwebtoken";
import { TokenService } from "./token.service";
import { ITokenService, IToken, IPayload } from "./token.interface";
import { IUserService, UserService } from "./user.service";
import { IUser } from "./user.dto";
import { getRepository } from "typeorm";
import { UserToken, User } from "./entity";
import { NotFoundError } from "../shared/errors";

/**
 * Inject dependencies of Service class
 */
export function createService(): IAuthService {
  const tokenRepository = getRepository(UserToken);
  const userRepository = getRepository(User);
  const tokenService = new TokenService(
    process.env.JWT_ISSUER,
    process.env.JWT_SECRET_FOR_ACCESS_TOKEN,
    Number(process.env.JWT_EXPIRY_ACCESS_TOKEN_IN_SEC) || 300,
    tokenRepository,
  );
  const userService = new UserService(userRepository);
  return new AuthService(tokenService, userService);
}

export interface IAuthService {
  signup(email: string, pwd: string): Promise<IToken>;
  login(email: string, pwd: string): Promise<IToken>;
  authenticate(accessToken: string): Promise<IToken>;
}

export class AuthService implements IAuthService {
  tokenService: ITokenService;
  userService: IUserService;
  constructor(tokenService: ITokenService, userService: IUserService) {
    this.tokenService = tokenService;
    this.userService = userService;
  }

  /**
   * Creates a user and generate token.
   * @param email 
   * @param pwd 
   * @throws {WrongInputError} Email is in use
   * @throws {Error} Uncaught Error
   */
  public async signup(email: string, pwd: string): Promise<IToken> {
    try {
      await this.userService.signup(email, pwd);
    } catch (err) {
      console.log(err);
      throw err;
    }
    // Generate New Tokens
    const token = await this.tokenService.generateAccessToken(email);
    return token;
  }

  /**
   * Login a user by matching his password, then generate access and refresh tokens.
   * @param email 
   * @param pwd
   * @throws {WrongInputError} Wrong password
   * @throws {NotFoundError} user is not found
   * @throws {Error} Uncaught Error
   */
  public async login(email: string, pwd: string): Promise<IToken> {
    try {
      await this.userService.login(email, pwd);
    } catch (err) {
      throw err;
    }
    // Generate tokens
    const token = await this.tokenService.generateAccessToken(email);
    return token;
  }

  /**
   * Verify access token
   * @param accessToken 
   * @throws {NotFoundError} Token not found
   * @throws {TokenVerifyError} Token is revoked or verification failed.
   * @throws {Error} Uncaught Error
   */
  public async authenticate(accessToken: string): Promise<IToken> {
    let payload: IPayload;
    let user: IUser;
    try {
      payload = await this.tokenService.verifyAccessToken(accessToken);
      user = await this.userService.getUser(payload.user);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        console.log("Token has expired, generating new token");
        let newToken;
        try {
          newToken = await this.refresh(accessToken);
        } catch (err) {
          throw err;
        }
        return newToken;
      }
      throw err;
    }
    return accessToken;
  }

  async refresh(oldToken: string): Promise<IToken> {
    const userId = await this.tokenService.getUserIdFromAccessToken(oldToken);
    let user;
    try {
      user = await this.userService.getUser(userId);
    } catch (err) {
      throw new NotFoundError("User is not found.");
    }
    const token = await this.tokenService.generateAccessToken(userId);
    return token;
  }
}
